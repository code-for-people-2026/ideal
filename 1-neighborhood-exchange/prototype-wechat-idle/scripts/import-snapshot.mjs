import { readFile, access } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { accountCode, validateSnapshot } from '../lib/snapshot.mjs';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';

const { values } = parseArgs({ options: { from: { type: 'string', default: 'data' }, assets: { type: 'string', default: 'dist' }, check: { type: 'boolean', default: false } } });
if (!values.check && values.assets !== 'dist') throw new Error('正式导入只能检查已准备部署的 dist 图片');
const [people, items, metadata] = await Promise.all(['people', 'items', 'metadata'].map(async name => JSON.parse(await readFile(resolve(values.from, `${name}.json`), 'utf8'))));
const assets = validateSnapshot({ people, items, metadata });
await Promise.all(assets.map(path => access(resolve(values.assets, path))));
if (values.check) {
  console.log(`候选快照通过：${items.length} 条物品、${people.length} 位发布人、${metadata.photoMessages} 张图。`);
  process.exit(0);
}
if (!process.env.DATABASE_URL) throw new Error('未配置 DATABASE_URL');
const sql = neon(process.env.DATABASE_URL);
await sql.transaction([
  sql`CREATE TABLE IF NOT EXISTS idle_snapshots (
    id text PRIMARY KEY, account_code text NOT NULL, observed_at timestamptz NOT NULL,
    metadata jsonb NOT NULL CHECK (metadata->>'account' = '司徒比特'),
    CHECK (account_code = 'situbite')
  )`,
  sql`CREATE TABLE IF NOT EXISTS idle_publishers (
    snapshot_id text NOT NULL REFERENCES idle_snapshots(id) ON DELETE CASCADE,
    publisher_id integer NOT NULL, payload jsonb NOT NULL,
    PRIMARY KEY (snapshot_id, publisher_id)
  )`,
  sql`CREATE TABLE IF NOT EXISTS idle_listings (
    snapshot_id text NOT NULL REFERENCES idle_snapshots(id) ON DELETE CASCADE,
    id text NOT NULL, publisher_id integer NOT NULL, display_order integer NOT NULL,
    payload jsonb NOT NULL,
    PRIMARY KEY (snapshot_id, id),
    FOREIGN KEY (snapshot_id, publisher_id) REFERENCES idle_publishers(snapshot_id, publisher_id)
  )`
]);
const observedAt = metadata.end.replace(' ', 'T') + '+08:00';
const snapshotId = `${accountCode}-${metadata.end.replace(/[^0-9]/g, '')}`;
await sql.transaction([
  sql`INSERT INTO idle_snapshots (id, account_code, observed_at, metadata)
      VALUES (${snapshotId}, ${accountCode}, ${observedAt}, ${JSON.stringify(metadata)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET metadata = EXCLUDED.metadata, observed_at = EXCLUDED.observed_at`,
  sql`DELETE FROM idle_listings WHERE snapshot_id = ${snapshotId}`,
  sql`DELETE FROM idle_publishers WHERE snapshot_id = ${snapshotId}`,
  sql`INSERT INTO idle_publishers (snapshot_id, publisher_id, payload)
      SELECT ${snapshotId}, (p->>'id')::integer, p FROM jsonb_array_elements(${JSON.stringify(people)}::jsonb) AS p`,
  sql`INSERT INTO idle_listings (snapshot_id, id, publisher_id, display_order, payload)
      SELECT ${snapshotId}, p->>'id', (p->>'owner')::integer, position::integer, p
      FROM jsonb_array_elements(${JSON.stringify(items)}::jsonb) WITH ORDINALITY AS records(p, position)`
]);
console.log(`已导入司徒比特快照：${items.length} 条物品、${people.length} 位发布人、${metadata.photoMessages} 张发布图。`);
