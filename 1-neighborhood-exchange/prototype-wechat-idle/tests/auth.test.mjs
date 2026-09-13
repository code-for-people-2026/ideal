import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { hashPassword, checkPassword, sessionToken, authenticated, sessionCookie } from '../lib/auth.mjs';

test('密码、会话群归属、签名、有效期、轮换及 Cookie 属性', async () => {
  process.env.IDLE_SESSION_SECRET = randomBytes(32).toString('hex');
  process.env.IDLE_BAOLONG_PASSWORD_HASH = await hashPassword('baolong-test-password');
  process.env.IDLE_LUANSHAN_PASSWORD_HASH = await hashPassword('luanshan-test-password');
  assert.equal(await checkPassword('baolong', 'baolong-test-password'), true);
  assert.equal(await checkPassword('luanshan', 'baolong-test-password'), false);
  const now = Date.now();
  const token = sessionToken('baolong', now);
  const request = value => new Request('https://example.com/api/catalog?group=baolong', { headers: { Cookie: value } });
  assert.equal(authenticated(request('idle_baolong=' + token), 'baolong', now), true);
  assert.equal(authenticated(request('idle_luanshan=' + token), 'luanshan', now), false);
  assert.equal(authenticated(request('idle_baolong=' + token.replace('baolong', 'luanshan')), 'baolong', now), false);
  assert.equal(authenticated(request('idle_baolong=' + token), 'baolong', now + 8 * 86400000), false);
  assert.equal(authenticated(request('idle_baolong=malformed'), 'baolong', now), false);
  process.env.IDLE_BAOLONG_PASSWORD_HASH = await hashPassword('rotated-password');
  assert.equal(authenticated(request('idle_baolong=' + token), 'baolong', now), false);
  const cookie = sessionCookie(request(''), 'baolong', token);
  for (const attr of ['HttpOnly', 'SameSite=Strict', 'Secure', 'Path=/']) assert.ok(cookie.includes(attr));
});
