export const accountCode = 'situbite';

const parseTime = value => typeof value === 'string' ? Date.parse(value.replace(' ', 'T') + '+08:00') : NaN;
function publicationTime(item, end) {
  if (item.publishedAt) return parseTime(item.publishedAt);
  // 兼容首次导入仅有月日的快照，跨年时选择截止时间之前最近的一年。
  const year = Number(end.slice(0, 4));
  const suffix = item.date?.replace('.', '-');
  return [year, year - 1].map(y => parseTime(`${y}-${suffix}:00`)).find(t => t <= parseTime(end));
}

export function validateSnapshot({ people, items, metadata }) {
  if (metadata?.account !== '司徒比特') throw new Error('账号来源不匹配');
  if (!Array.isArray(people) || !Array.isArray(items)) throw new Error('快照格式错误');
  if (!items.length && metadata.captureComplete !== true) throw new Error('空快照缺少成功采集证据');
  const start = parseTime(metadata.start), end = parseTime(metadata.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) throw new Error('快照时间范围无效');
  const owners = new Set(people.map(p => p.id));
  const ids = new Set(items.map(i => i.id));
  if (owners.size !== people.length || ids.size !== items.length) throw new Error('快照 ID 重复');
  const assetPaths = [];
  for (const profile of people) {
    if (!Number.isInteger(profile.id) || !profile.nick) throw new Error('发布人资料不完整');
    assetPaths.push(profile.avatar);
  }
  for (const item of items) {
    if (!owners.has(item.owner) || !['baolong', 'luanshan'].includes(item.group)) throw new Error('发布人或群归属不匹配');
    const group = metadata.groups?.[item.group];
    if (!group?.earliest || !group?.latest || !item.title || !Array.isArray(item.images) || !Array.isArray(item.events)) throw new Error('物品记录不完整');
    const date = publicationTime(item, metadata.end);
    const first = parseTime(group.earliest);
    if (!Number.isFinite(date) || date < first - 60000 || date < start - 60000) throw new Error('物品早于本账号可读记录或本周范围');
    if (date > end) throw new Error('物品晚于采集截止时间');
    assetPaths.push(...item.images.map(photo => photo.src));
  }
  if (assetPaths.some(path => typeof path !== 'string' || !/^assets\/situbite-[a-z0-9-]+\.jpg$/.test(path))) throw new Error('图片来源不匹配');
  if (metadata.photoCards !== items.filter(i => i.images.length).length || metadata.textRows !== items.filter(i => !i.images.length).length || metadata.photoMessages !== items.reduce((n, i) => n + i.images.length, 0)) throw new Error('统计与物品不匹配');
  return [...new Set(assetPaths)];
}
