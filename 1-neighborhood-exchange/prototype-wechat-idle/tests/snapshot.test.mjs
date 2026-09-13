import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSnapshot } from '../lib/snapshot.mjs';

const snapshot = {
  people: [{ id: 1, nick: '测试发布人', avatar: 'assets/situbite-test-avatar.jpg' }],
  items: [{ id: 'test-item', owner: 1, group: 'baolong', title: '测试物品', date: '09.10 20:28', images: [{ src: 'assets/situbite-test-photo.jpg' }], events: [] }],
  metadata: { account: '司徒比特', start: '2026-09-06 02:00:00', end: '2026-09-13 02:00:00', groups: { baolong: { earliest: '2026-09-06 07:56:56', latest: '2026-09-12 20:28:00' } }, photoCards: 1, photoMessages: 1, textRows: 0 }
};
test('接受同一账号内对应群的发布人和图片路径', () => {
  assert.deepEqual(validateSnapshot(snapshot), ['assets/situbite-test-avatar.jpg', 'assets/situbite-test-photo.jpg']);
});
test('阻止混入其他账号的数据或图片', () => {
  const wrongAccount = structuredClone(snapshot);
  wrongAccount.metadata.account = '其他账号';
  assert.throws(() => validateSnapshot(wrongAccount), /账号/);
  const wrongPhoto = structuredClone(snapshot);
  wrongPhoto.items[0].images[0].src = 'assets/other-account.jpg';
  assert.throws(() => validateSnapshot(wrongPhoto), /图片来源/);
});
test('阻止早于本账号聊天记录的物品和不存在的发布人', () => {
  const early = structuredClone(snapshot);
  early.items[0].publishedAt = '2020-01-01 00:00:00';
  assert.throws(() => validateSnapshot(early), /早于/);
  const orphan = structuredClone(snapshot);
  orphan.items[0].owner = 99999;
  assert.throws(() => validateSnapshot(orphan), /发布人/);
});

test('跨年快照按完整发布时间校验，不再依赖固定年份', () => {
  const future = structuredClone(snapshot);
  future.items = [future.items[0]];
  future.people = future.people.filter(p => p.id === future.items[0].owner);
  future.metadata.start = '2026-12-27 02:00:00';
  future.metadata.end = '2027-01-03 02:00:00';
  future.metadata.groups[future.items[0].group].earliest = '2026-12-31 20:28:00';
  future.metadata.groups[future.items[0].group].latest = '2027-01-02 20:28:00';
  future.metadata.photoCards = 1;
  future.metadata.textRows = 0;
  future.metadata.photoMessages = future.items[0].images.length;
  future.items[0].publishedAt = '2026-12-31 20:28:00';
  future.items[0].date = '12.31 20:28';
  assert.doesNotThrow(() => validateSnapshot(future));
  delete future.items[0].publishedAt;
  assert.doesNotThrow(() => validateSnapshot(future));
  future.items[0].publishedAt = '2027-01-04 20:28:00';
  assert.throws(() => validateSnapshot(future), /晚于/);
});

test('完整采集后的空周可展示，采集失败不能变成空快照', () => {
  const empty = { people: [], items: [], metadata: { ...snapshot.metadata, captureComplete: true, photoCards: 0, photoMessages: 0, textRows: 0 } };
  assert.deepEqual(validateSnapshot(empty), []);
  delete empty.metadata.captureComplete;
  assert.throws(() => validateSnapshot(empty), /采集证据/);
});
