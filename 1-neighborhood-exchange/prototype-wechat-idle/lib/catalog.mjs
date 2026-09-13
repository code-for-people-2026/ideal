import { neon } from '@neondatabase/serverless';
import { accountCode } from './snapshot.mjs';

export function selectGroup(catalog, group) {
  const items = catalog.items.filter(item => item.group === group);
  const owners = new Set(items.map(item => item.owner));
  return {
    items,
    people: catalog.people.filter(person => owners.has(person.id)),
    metadata: {
      account: catalog.metadata.account, start: catalog.metadata.start, end: catalog.metadata.end,
      groups: { [group]: catalog.metadata.groups[group] },
      photoCards: items.filter(item => item.images.length).length,
      photoMessages: items.reduce((count, item) => count + item.images.length, 0),
      textRows: items.filter(item => !item.images.length).length,
      captureComplete: true
    }
  };
}

export async function readCatalog() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_NOT_CONFIGURED');
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT s.metadata,
      COALESCE((SELECT jsonb_agg(p.payload ORDER BY p.publisher_id) FROM idle_publishers p WHERE p.snapshot_id = s.id), '[]'::jsonb) AS people,
      COALESCE((SELECT jsonb_agg(l.payload ORDER BY l.display_order) FROM idle_listings l WHERE l.snapshot_id = s.id), '[]'::jsonb) AS items
    FROM idle_snapshots s WHERE s.account_code = ${accountCode}
    ORDER BY s.observed_at DESC, s.id DESC LIMIT 1
  `;
  const catalog = rows[0];
  if (!catalog || !Array.isArray(catalog.people) || !Array.isArray(catalog.items) || catalog.metadata.account !== '司徒比特' || (!catalog.items.length && catalog.metadata.captureComplete !== true)) throw new Error('SNAPSHOT_UNAVAILABLE');
  return catalog;
}
