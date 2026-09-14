import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { hashPassword, sessionToken } from '../lib/auth.mjs';
import { invitation, checkInvitation } from '../lib/share.mjs';
import handler from '../api/share.js';

test('分享二维码仅授权本群，匿名无法生成，密码轮换后旧二维码失效', async () => {
  const keys = ['IDLE_SESSION_SECRET', 'IDLE_BAOLONG_PASSWORD_HASH', 'IDLE_LUANSHAN_PASSWORD_HASH'];
  const previous = keys.map(key => process.env[key]);
  try {
    process.env.IDLE_SESSION_SECRET = randomBytes(32).toString('hex');
    process.env.IDLE_BAOLONG_PASSWORD_HASH = await hashPassword('fixture-baolong');
    process.env.IDLE_LUANSHAN_PASSWORD_HASH = await hashPassword('fixture-luanshan');
    const invite = invitation('baolong');
    assert.equal(checkInvitation('baolong', invite), true);
    assert.equal(checkInvitation('luanshan', invite), false);
    assert.equal(checkInvitation('baolong', invite.slice(0,-1) + (invite.endsWith('0') ? '1' : '0')), false);
    for (const malformed of [null, '', 'fixture-baolong', {}, 'v1.baolong.invalid']) assert.equal(checkInvitation('baolong', malformed), false);
    const url = 'https://example.test/api/share?group=baolong';
    assert.equal((await handler.fetch(new Request(url))).status, 401);
    const cookie = `idle_baolong=${sessionToken('baolong')}`;
    const response = await handler.fetch(new Request(url, {headers:{cookie}}));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /private.*no-store/);
    assert.deepEqual(await response.json(), {path:`/baolong#invite=${invite}`});
    assert.equal((await handler.fetch(new Request(url.replace('baolong','luanshan'), {headers:{cookie}}))).status, 401);
    assert.equal((await handler.fetch(new Request(url, {method:'POST',headers:{cookie}}))).status, 405);
    process.env.IDLE_BAOLONG_PASSWORD_HASH = await hashPassword('fixture-rotated');
    assert.equal(checkInvitation('baolong', invite), false);
  } finally {
    keys.forEach((key,i) => previous[i] === undefined ? delete process.env[key] : process.env[key] = previous[i]);
  }
});
