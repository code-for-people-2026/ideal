import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {z} from 'zod';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const order=z.object({id:z.string().min(1),date,customer:z.string().min(1),location:z.string(),item:z.string().min(1),quantity:z.string().min(1),amount:z.number().nonnegative().nullable(),payment:z.enum(['paid','sent','redpacket','none']),note:z.string()});
const schema=z.array(z.object({groupId:z.enum(['taozi','jingjing','yuma']),date,snapshotAt:z.string().datetime({offset:true}),orders:z.array(order),exceptions:z.array(z.object({date,text:z.string()}))})).min(1);
if(!process.argv[2])throw Error('需要传入每日快照 JSON 路径');
const raw=await readFile(process.argv[2],'utf8');const days=schema.parse(JSON.parse(raw));
const seenDays=new Set(),seenOrders=new Set();
for(const d of days){const key=`${d.groupId}:${d.date}`;if(seenDays.has(key))throw Error('重复日期');seenDays.add(key);for(const o of d.orders){const k=`${d.groupId}:${o.id}`;if(o.date!==d.date||seenOrders.has(k))throw Error('订单日期或稳定标识错误');seenOrders.add(k)}if(d.exceptions.some(e=>e.date!==d.date))throw Error('异常记录日期错误')}
const digest=createHash('sha256').update(raw).digest('hex');const sql=neon(process.env.DATABASE_URL);
const existing=await sql`SELECT digest FROM ledger_imports WHERE digest=${digest}`;
if(existing.length){console.log('此批数据已导入，无需重复写入');process.exit(0)}
// 单次事务发布全部群日期；不会修改 ledger_confirmations，重复运行也不会清除人工核对。
await sql.transaction([
 ...days.map(d=>sql`INSERT INTO ledger_days(group_id,date,snapshot_at,data) VALUES(${d.groupId},${d.date},${d.snapshotAt},${JSON.stringify({orders:d.orders,exceptions:d.exceptions})}::jsonb)
 ON CONFLICT(group_id,date) DO UPDATE SET snapshot_at=EXCLUDED.snapshot_at,data=EXCLUDED.data,updated_at=now() WHERE ledger_days.snapshot_at::timestamptz<=EXCLUDED.snapshot_at::timestamptz`),
 sql`INSERT INTO ledger_imports(digest,day_count) VALUES(${digest},${days.length}) ON CONFLICT(digest) DO NOTHING`
]);
const verified=await sql`SELECT group_id,count(*)::int AS days,sum(jsonb_array_length(data->'orders'))::int AS orders FROM ledger_days GROUP BY group_id ORDER BY group_id`;
console.log(JSON.stringify({importedDays:days.length,totals:verified}));
