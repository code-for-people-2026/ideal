import {writeFile} from 'node:fs/promises';
import {neon} from '@neondatabase/serverless';
if(!process.argv[2])throw Error('需要输出路径');
const sql=neon(process.env.DATABASE_URL);
const days=await sql`SELECT group_id AS "groupId",date::text,snapshot_at AS "snapshotAt",data FROM ledger_days ORDER BY group_id,date`;
const confirmations=await sql`SELECT group_id,order_id,confirmed,version,updated_at FROM ledger_confirmations`;
await writeFile(process.argv[2],JSON.stringify({days:days.map(d=>({groupId:d.groupId,date:d.date,snapshotAt:d.snapshotAt,...d.data})),confirmations},null,2));
console.log(`已导出 ${days.length} 个群日期，${confirmations.length} 条人工确认`);
