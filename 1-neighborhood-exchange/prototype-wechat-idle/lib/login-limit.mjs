import { neon } from '@neondatabase/serverless';
import { sign } from './auth.mjs';

export async function allowLogin(request, group) {
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown' : 'local';
  const key = sign(`login:${group}:${ip.split(',')[0].trim()}`);
  const sql = neon(process.env.DATABASE_URL);
  const [row] = await sql`
    INSERT INTO idle_login_limits (key, attempts, expires_at)
    VALUES (${key}, 1, now() + interval '15 minutes')
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN idle_login_limits.expires_at <= now() THEN 1 ELSE idle_login_limits.attempts + 1 END,
      expires_at = CASE WHEN idle_login_limits.expires_at <= now() THEN now() + interval '15 minutes' ELSE idle_login_limits.expires_at END
    RETURNING attempts
  `;
  return row.attempts <= 30;
}
