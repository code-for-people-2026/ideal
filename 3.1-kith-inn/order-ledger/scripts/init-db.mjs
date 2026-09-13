import {neon} from '@neondatabase/serverless';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL missing');
const sql=neon(process.env.DATABASE_URL);
await sql.transaction([
 sql`CREATE TABLE IF NOT EXISTS ledger_days(group_id text NOT NULL CHECK(group_id IN ('taozi','jingjing','yuma')),date date NOT NULL,snapshot_at text NOT NULL,data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(group_id,date))`,
 sql`CREATE TABLE IF NOT EXISTS ledger_confirmations(group_id text NOT NULL,order_id text NOT NULL,confirmed boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(group_id,order_id))`,
 sql`ALTER TABLE ledger_confirmations ADD COLUMN IF NOT EXISTS basis jsonb`,
 sql`CREATE TABLE IF NOT EXISTS ledger_imports(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,imported_at timestamptz NOT NULL DEFAULT now(),digest text UNIQUE NOT NULL,day_count integer NOT NULL)`,
 sql`CREATE TABLE IF NOT EXISTS ledger_sync_status(group_id text PRIMARY KEY CHECK(group_id IN ('taozi','jingjing','yuma')),synced_at timestamptz NOT NULL)`
]);console.log('数据库表已就绪');
