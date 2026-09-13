import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { startServer } from '../scripts/dev-server.mjs';
import { checkAccess } from '../scripts/check-access.mjs';
import { sessionToken } from '../lib/auth.mjs';
import { sign } from '../lib/auth.mjs';
import { allowLogin } from '../lib/login-limit.mjs';
import { randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

test('登录次数限制由数据库执行，到期后重置', async () => {
  const savedSecret = process.env.IDLE_SESSION_SECRET;
  const savedVercel = process.env.VERCEL;
  process.env.IDLE_SESSION_SECRET = randomBytes(32).toString('hex');
  delete process.env.VERCEL;
  const key = sign('login:baolong:local');
  const sql = neon(process.env.DATABASE_URL);
  const request = new Request('https://example.com/api/access?group=baolong');
  try {
    await sql`INSERT INTO idle_login_limits (key, attempts, expires_at) VALUES (${key}, 30, now() + interval '15 minutes')`;
    assert.equal(await allowLogin(request, 'baolong'), false);
    await sql`UPDATE idle_login_limits SET expires_at = now() - interval '1 minute' WHERE key = ${key}`;
    assert.equal(await allowLogin(request, 'baolong'), true);
  } finally {
    await sql`DELETE FROM idle_login_limits WHERE key = ${key}`;
    process.env.IDLE_SESSION_SECRET = savedSecret;
    if (savedVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = savedVercel;
  }
});

test('密码保护、图片与头像授权、跨群拒绝、刷新、退出及手机页面', async () => {
  const server = await startServer(0);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try { console.log(await checkAccess(browser, 'http://127.0.0.1:' + server.address().port)); }
  finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});

test('登录后的暂时失败自动恢复，持续失败可重试，失效会话回到密码页', async () => {
  const server = await startServer(0);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const origin = 'http://127.0.0.1:' + server.address().port;
    const context = await browser.newContext();
    await context.addCookies([{ name: 'idle_baolong', value: sessionToken('baolong'), url: origin }]);
    const page = await context.newPage();
    let failures = 1;
    await page.route('**/api/catalog?group=*', route => failures-- > 0 ? route.fulfill({ status: 503, body: '{}' }) : route.continue());
    await page.goto(origin + '/baolong');
    await page.waitForFunction(() => document.querySelector('#updated-at').textContent.startsWith('数据截至'));
    assert.ok(failures < 0);
    failures = 10;
    await page.reload();
    await page.getByRole('button', { name: '重新加载', exact: true }).waitFor();
    failures = 0;
    await page.getByRole('button', { name: '重新加载', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#updated-at').textContent.startsWith('数据截至'));
    await context.clearCookies();
    await page.reload();
    await page.locator('#access-form').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.card').count(), 0);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});
