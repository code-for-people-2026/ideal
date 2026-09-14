import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {neon} from '@neondatabase/serverless';
import {z} from 'zod';

// 仅在采集、比对及云端核验完成后执行；无新订单也记录本次检查。
const [captureDir, reportPath] = process.argv.slice(2);
if (!captureDir || !reportPath) throw Error('需要采集目录及核验报告路径');
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const manifest = await read(join(captureDir, 'manifest.json'));
const timestamp = z.string().datetime({offset:true}).parse(manifest.capturedAt);
const report = z.object({capturedAt:z.literal(timestamp),status:z.literal('verified'),manualConfirmationsPreserved:z.literal(true),totalOrders:z.number().int().nonnegative()}).parse(await read(reportPath));
const settings = await read(process.env.ORDER_LEDGER_CONFIG || new URL('../sync.config.json',import.meta.url));
const groups = settings.groups;
if (Object.keys(groups).sort().join(',') !== 'jingjing,taozi,yuma') throw Error('目标群配置不完整');
if (manifest.account !== settings.account) throw Error('采集账号不匹配');
for (const [group, chat] of Object.entries(groups)) {
  const data = await read(join(captureDir, group + '.json'));
  const cards = await read(join(captureDir, group + '-cards.json'));
  if (manifest.groups?.[group] !== chat || data.username !== chat || !Array.isArray(data.messages) || data.count !== data.messages.length || data.count >= 100000 || Object.keys(data.failures ?? {}).length || !Array.isArray(cards)) throw Error('采集不完整，不能更新同步时间');
}
const sql = neon(process.env.DATABASE_URL);
const [count] = await sql`SELECT coalesce(sum(jsonb_array_length(data->'orders')),0)::int AS total FROM ledger_days`;
if (count.total !== report.totalOrders) throw Error('云端订单数与核验报告不一致');
await sql.transaction(Object.keys(groups).map(group => sql`
  INSERT INTO ledger_sync_status(group_id,synced_at) VALUES(${group},${timestamp}::timestamptz)
  ON CONFLICT(group_id) DO UPDATE SET synced_at=EXCLUDED.synced_at
  WHERE ledger_sync_status.synced_at < EXCLUDED.synced_at`));
console.log('三个群的最近同步时间已记录：' + timestamp);
