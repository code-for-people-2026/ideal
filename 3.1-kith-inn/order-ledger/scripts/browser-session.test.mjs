import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restoreGroupSession } from '../lib/browser-session.ts';

function browser(hash = '', entries = {}, status = 200) {
  const storage = new Map(Object.entries(entries));
  const requests = [];
  globalThis.window = {
    location: { hash, pathname: '/taozi/', search: '?date=2026-09-12' },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    history: { replaceState: (_state, _title, url) => {
      window.location.hash = '';
      window.lastUrl = url;
    } },
  };
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return new Response(null, { status });
  };
  return { storage, requests };
}

test('专属链接保存到对应群，去掉链接参数后仍能建立新会话', async () => {
  const { storage, requests } = browser('#key=tao-key');
  assert.equal(await restoreGroupSession('taozi'), true);
  assert.equal(storage.get('duizhang:token:taozi'), 'tao-key');
  assert.equal(window.lastUrl, '/taozi/?date=2026-09-12');
  assert.equal(await restoreGroupSession('taozi'), true);
  assert.deepEqual(requests, [{ group: 'taozi', key: 'tao-key' }, { group: 'taozi', key: 'tao-key' }]);
});

test('三个群分别记住 token，不借用其他群的 token', async () => {
  const { requests } = browser('', { 'duizhang:token:taozi': 'tao-key', 'duizhang:token:yuma': 'yu-key' });
  assert.equal(await restoreGroupSession('jingjing'), true);
  assert.equal(requests.length, 0);
  await restoreGroupSession('yuma');
  assert.deepEqual(requests, [{ group: 'yuma', key: 'yu-key' }]);
});

test('新链接验证成功后替换旧 token', async () => {
  const { storage } = browser('#key=new-key', { 'duizhang:token:taozi': 'old-key' });
  await restoreGroupSession('taozi');
  assert.equal(storage.get('duizhang:token:taozi'), 'new-key');
});

test('错误链接不覆盖已有 token，已失效的缓存只清理对应群', async () => {
  let result = browser('#key=invalid', { 'duizhang:token:taozi': 'valid-key' }, 401);
  assert.equal(await restoreGroupSession('taozi'), false);
  assert.equal(result.storage.get('duizhang:token:taozi'), 'valid-key');
  result = browser('', { 'duizhang:token:taozi': 'expired', 'duizhang:token:yuma': 'yu-key' }, 401);
  assert.equal(await restoreGroupSession('taozi'), false);
  assert.equal(result.storage.has('duizhang:token:taozi'), false);
  assert.equal(result.storage.get('duizhang:token:yuma'), 'yu-key');
});

test('服务暂时失败保留缓存以便重试', async () => {
  const { storage } = browser('', { 'duizhang:token:taozi': 'valid-key' }, 503);
  await assert.rejects(restoreGroupSession('taozi'), /请重试/);
  assert.equal(storage.get('duizhang:token:taozi'), 'valid-key');
});

test('浏览器禁用存储时专属链接仍可登录', async () => {
  browser('#key=tao-key');
  Object.defineProperty(window, 'localStorage', { get() { throw Error('disabled'); } });
  assert.equal(await restoreGroupSession('taozi'), true);
  assert.equal(window.location.hash, '');
});
