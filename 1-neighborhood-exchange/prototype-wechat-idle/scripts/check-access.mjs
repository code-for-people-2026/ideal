import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { selectGroup } from '../lib/catalog.mjs';

export async function checkAccess(browser, origin, { extraHTTPHeaders = {} } = {}) {
  const [items, people, metadata] = await Promise.all(['items', 'people', 'metadata'].map(async name => JSON.parse(await readFile(`data/${name}.json`, 'utf8'))));
  const { passwords } = JSON.parse(await readFile('.local/group-access.json', 'utf8'));
  const expected = { items, people, metadata };
  const results = [];
  for (const group of ['baolong', 'luanshan']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, extraHTTPHeaders });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const requestedUrls = [];
    page.on('request', request => requestedUrls.push(request.url()));
    const other = group === 'baolong' ? 'luanshan' : 'baolong';
    const own = selectGroup(expected, group);
    const otherOnly = selectGroup(expected, other);
    const ownAssets = [...new Set([...own.items.flatMap(i => i.images.map(p => p.src)), ...own.people.map(p => p.avatar)])];
    const forbiddenAssets = [otherOnly.items.flatMap(i => i.images.map(p => p.src)).find(p => !ownAssets.includes(p)), otherOnly.people.map(p => p.avatar).find(p => !ownAssets.includes(p))].filter(Boolean);
    const mediaUrl = (file, scope = group) => `${origin}/api/media?group=${scope}&file=${encodeURIComponent(file)}`;
    try {
      assert.equal((await page.request.get(origin + '/api/catalog')).status(), 400);
      for (const scope of [group, other]) assert.equal((await page.request.get(`${origin}/api/catalog?group=${scope}`)).status(), 401);
      if (ownAssets[0]) assert.equal((await page.request.get(mediaUrl(ownAssets[0]))).status(), 401);
      const response = await page.goto(`${origin}/${group}`, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      assert.equal(page.url(), `${origin}/${group}`);
      await page.locator('#access-form').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.card').count(), 0);
      assert.equal(await page.locator(`a[href="/${other}"]`).count(), 0);
      assert.equal(await page.locator('#catalog-content').isVisible(), false);
      await page.screenshot({ path: `.local/${group}-password-desktop.png` });
      await page.goto(`${origin}/${group}#password=${encodeURIComponent(passwords[other])}`);
      await page.getByText('密码不正确，请使用本群的访问密码。', { exact: true }).waitFor();
      assert.equal((await page.request.get(`${origin}/api/catalog?group=${group}`)).status(), 401);
      await page.goto(`${origin}/${group}#password=${encodeURIComponent(passwords[group])}`);
      await page.waitForFunction(() => !document.querySelector('#catalog-content').hidden && document.querySelector('#updated-at').textContent.startsWith('数据截至'), null, { timeout: 45000 });
      const groupApi = await page.request.get(`${origin}/api/catalog?group=${group}`);
      assert.equal(page.url(), `${origin}/${group}`);
      assert.equal(await page.locator('#group-password').inputValue(), '');
      assert.ok(requestedUrls.every(url => !Object.values(passwords).some(password => url.includes(password))));
      assert.equal(groupApi.status(), 200);
      assert.match(groupApi.headers()['cache-control'], /private.*no-store/);
      assert.deepEqual(await groupApi.json(), own);
      assert.equal((await page.request.get(`${origin}/api/catalog?group=${other}`)).status(), 401);
      assert.equal((await page.request.post(`${origin}/api/access?group=${other}`, { headers: { Origin: origin }, data: { password: passwords[group] } })).status(), 401);
      assert.equal((await page.request.post(`${origin}/api/access?group=${group}`, { headers: { Origin: 'https://unrelated.example' }, data: { password: passwords[group] } })).status(), 403);
      for (const file of forbiddenAssets) {
        assert.equal((await page.request.get(mediaUrl(file))).status(), 404);
        assert.equal((await page.request.get(mediaUrl(file, other))).status(), 401);
      }
      for (const path of ['/assets/' + ownAssets[0]?.split('/').pop(), '/dist/' + ownAssets[0], '/data/items.json', '/people.json', '/.local/group-access.json', '/api/../data/items.json']) {
        assert.equal((await page.request.get(origin + path)).status(), 404, path);
      }
      assert.equal((await page.request.get(mediaUrl('../.env.local'))).status(), 404);
      assert.deepEqual(await page.locator('.card').evaluateAll(nodes => nodes.map(n => n.dataset.itemId)), own.items.filter(i => i.images.length).map(i => i.id));
      assert.equal(await page.locator('.compact-row').count(), own.metadata.textRows);
      assert.equal(await page.locator('#photo-count').textContent(), String(own.metadata.photoMessages));
      assert.equal(await page.locator('#publisher-count').textContent(), String(own.people.length));
      const broken = await page.evaluate(async urls => {
        const failures = [];
        for (let offset = 0; offset < urls.length; offset += 8) {
          const batch = await Promise.all(urls.slice(offset, offset + 8).map(url => new Promise(resolve => {
            const image = new Image();
            const timer = setTimeout(() => resolve(url), 30000);
            image.onload = () => { clearTimeout(timer); resolve(null); };
            image.onerror = () => { clearTimeout(timer); resolve(url); };
            image.src = url;
          })));
          failures.push(...batch.filter(Boolean));
        }
        return failures;
      }, ownAssets.map(file => mediaUrl(file)));
      assert.deepEqual(broken, []);
      if (own.metadata.photoCards) {
        const first = own.items.find(i => i.images.length);
        await page.locator('.card').first().click();
        assert.equal(await page.locator('.profile h3').textContent(), own.people.find(p => p.id === first.owner).nick);
        await page.waitForFunction(() => document.querySelector('.gallery-image')?.naturalWidth > 0 && document.querySelector('.profile img')?.naturalWidth > 0);
        await page.locator('#close').click();
      }
      await page.reload();
      await page.locator('#catalog-content').waitFor({ state: 'visible' });
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `.local/${group}-private-mobile.png` });
      await page.goto(`${origin}/${other}`);
      await page.locator('#access-form').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.card').count(), 0);
      await page.goto(`${origin}/${group}`);
      await page.locator('#logout').waitFor({ state: 'visible' });
      await page.locator('#logout').click();
      await page.locator('#access-form').waitFor({ state: 'visible' });
      assert.equal((await page.request.get(`${origin}/api/catalog?group=${group}`)).status(), 401);
      if (ownAssets[0]) assert.equal((await page.request.get(mediaUrl(ownAssets[0]))).status(), 401);
      assert.equal(await page.locator('.card').count(), 0);
      await page.screenshot({ path: `.local/${group}-password-mobile.png` });
      await page.goto(origin);
      await page.getByText('请通过群内分享的专属链接访问。', { exact: true }).waitFor();
      assert.equal(await page.locator('a[href="/baolong"], a[href="/luanshan"]').count(), 0);
      await page.goto(`${origin}/${group}#password=${encodeURIComponent(passwords[group])}`);
      await page.locator('#logout').waitFor({ state: 'visible' });
      assert.equal(page.url(), `${origin}/${group}`);
      assert.equal((await page.request.get(`${origin}/api/catalog?group=${other}`)).status(), 401);
      assert.ok(requestedUrls.every(url => !Object.values(passwords).some(password => url.includes(password))));
      assert.deepEqual(errors, []);
      results.push({ group, items: own.items.length, loadedAssets: ownAssets.length, unauthorizedBlocked: true, crossGroupBlocked: true });
    } finally { await context.close(); }
  }
  return { url: origin, end: metadata.end, groups: results, result: 'passed' };
}
