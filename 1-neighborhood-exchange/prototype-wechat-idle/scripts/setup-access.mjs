import { randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { hashPassword, groups } from '../lib/auth.mjs';

await mkdir('.local', { recursive: true });
let credentials;
try { credentials = JSON.parse(await readFile('.local/group-access.json', 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const passwords = Object.fromEntries(groups.map(group => [group, randomBytes(12).toString('base64url')]));
  const hashes = Object.fromEntries(await Promise.all(groups.map(async group => [group, await hashPassword(passwords[group])])));
  credentials = { passwords, hashes, sessionSecret: randomBytes(32).toString('hex') };
  await writeFile('.local/group-access.json', JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
}
const variables = Object.fromEntries(groups.map(group => [`IDLE_${group.toUpperCase()}_PASSWORD_HASH`, credentials.hashes[group]]));
variables.IDLE_SESSION_SECRET = credentials.sessionSecret;
let env = await readFile('.env.local', 'utf8');
env = env.split(/\r?\n/).filter(line => !Object.keys(variables).some(key => line.startsWith(key + '='))).join('\n').trimEnd() + '\n';
for (const [key, value] of Object.entries(variables)) env += `${key}="${value}"\n`;
await writeFile('.env.local', env);
await writeFile('.local/vercel-auth-env.json', JSON.stringify(Object.entries(variables).map(([key, value]) => ({ key, value, type: 'encrypted', target: ['production', 'preview', 'development'] }))));
const sql = neon(process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS idle_login_limits (key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL)`;
console.log('独立群密码和会话配置已保存在本机，登录频率限制表已就绪。');
