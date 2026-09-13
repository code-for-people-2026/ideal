import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
export const groups = ['baolong', 'luanshan'];
export const privateHeaders = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' };
const lifetime = 7 * 24 * 60 * 60;
export const cookieName = group => `idle_${group}`;
export function passwordHash(group) {
  const value = process.env[`IDLE_${group.toUpperCase()}_PASSWORD_HASH`];
  if (!/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(value || '')) throw new Error('AUTH_NOT_CONFIGURED');
  return value;
}
export function sign(value) {
  const secret = process.env.IDLE_SESSION_SECRET;
  if (!secret || secret.length < 64) throw new Error('AUTH_NOT_CONFIGURED');
  return createHmac('sha256', secret).update(value).digest('hex');
}
const equal = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await derive(password, salt, 32)).toString('hex')}`;
}
export async function checkPassword(group, password) {
  const [salt, expected] = passwordHash(group).split(':');
  return equal((await derive(password, salt, 32)).toString('hex'), expected);
}
export function sessionToken(group, now = Date.now()) {
  const payload = `${group}.${Math.floor(now / 1000) + lifetime}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${sign(payload + ':' + passwordHash(group))}`;
}
export function authenticated(request, group, now = Date.now()) {
  const token = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName(group) + '='))?.split('=')[1];
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== group || !/^\d{10}$/.test(parts[1]) || !/^[a-f0-9]{32}$/.test(parts[2]) || !/^[a-f0-9]{64}$/.test(parts[3])) return false;
  const seconds = Math.floor(now / 1000);
  if (Number(parts[1]) <= seconds || Number(parts[1]) > seconds + lifetime) return false;
  return equal(parts[3], sign(parts.slice(0, 3).join('.') + ':' + passwordHash(group)));
}
export function sessionCookie(request, group, token = '') {
  return `${cookieName(group)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? lifetime : 0}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export function authorize(request) {
  const group = new URL(request.url).searchParams.get('group');
  if (!groups.includes(group)) return { response: Response.json({ error: 'GROUP_REQUIRED' }, { status: 400, headers: privateHeaders }) };
  if (!authenticated(request, group)) return { response: Response.json({ error: 'PASSWORD_REQUIRED' }, { status: 401, headers: privateHeaders }) };
  return { group };
}
