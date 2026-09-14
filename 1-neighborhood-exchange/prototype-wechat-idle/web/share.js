import qrcode from '/qrcode.js';

const names = { baolong: '🌟宝龙二手闲置交易群🌟', luanshan: '峦山美地闲置物品小市集' };
const ink = '#243b30', muted = '#798277', accent = '#315a44';
const font = '"Microsoft YaHei", "PingFang SC", sans-serif';
let objectUrl, generation = 0, currentFile;

function lines(context, value, width, limit = Infinity) {
  const chars = Array.from(String(value || ''));
  const result = []; let line = '';
  for (let i = 0; i < chars.length; i++) {
    if (context.measureText(line + chars[i]).width > width && /[，。、；：！？）】]/.test(chars[i])) { line += chars[i]; continue; }
    if (chars[i] === '\n' || context.measureText(line + chars[i]).width > width) {
      if (result.length === limit - 1) {
        while (context.measureText(line + '…').width > width) line = line.slice(0, -1);
        result.push(line + '…'); return result;
      }
      result.push(line); line = chars[i] === '\n' ? '' : chars[i];
    } else line += chars[i];
  }
  if (line) result.push(line);
  return result;
}
function text(context, value, x, y, width, size, color = ink, weight = 400, limit = 1) {
  context.fillStyle = color; context.font = `${weight} ${size}px ${font}`;
  const rows = lines(context, value, width, limit);
  rows.forEach((line, i) => context.fillText(line, x, y + i * size * 1.5));
  return rows.length * size * 1.5;
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; reject(new Error('IMAGE_UNAVAILABLE')); }, 20000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('IMAGE_UNAVAILABLE')); };
    img.src = url;
  });
}
function picture(context, img, x, y, w, h, round = false) {
  context.save(); context.beginPath(); context.roundRect(x, y, w, h, round ? w / 2 : 12); context.clip();
  context.fillStyle = '#f1f3ec'; context.fillRect(x, y, w, h);
  const scale = round ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height);
  context.drawImage(img, x + (w - img.width * scale) / 2, y + (h - img.height * scale) / 2, img.width * scale, img.height * scale);
  context.restore();
}
function price(item) {
  return item.priceLabel || (item.price === null ? '价格未说明' : item.price === 0 ? '免费赠送' : `¥${item.price}${item.unit || ''}`);
}

async function poster(catalog, url, group) {
  if (!names[group] || catalog.items.some(item => item.group !== group)) throw new Error('GROUP_MISMATCH');
  const items = [...catalog.items.filter(i => i.images.length), ...catalog.items.filter(i => !i.images.length)];
  const owners = new Map(catalog.people.map(p => [p.id, p]));
  const paths = [...new Set(items.flatMap(i => [owners.get(i.owner).avatar, ...(i.images[0] ? [i.images[0].src] : [])]))];
  const images = new Map();
  for (let i = 0; i < paths.length; i += 8) {
    await Promise.all(paths.slice(i, i + 8).map(async path => images.set(path, await loadImage(`/api/media?group=${group}&file=${encodeURIComponent(path)}`))));
  }
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  const width = 720, scale = 1.5, rowHeight = 196, headerHeight = 270, footerHeight = 290;
  canvas.width = width * scale; canvas.height = (headerHeight + Math.max(items.length, 1) * rowHeight + footerHeight) * scale;
  const c = canvas.getContext('2d'); c.scale(scale, scale); c.textBaseline = 'top';
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, width, canvas.height / scale);
  c.fillStyle = accent; c.fillRect(40, 34, 36, 5);
  text(c, names[group], 40, 62, 640, 34, ink, 700, 2);
  text(c, `${catalog.metadata.start.slice(5,10).replace('-','.')} — ${catalog.metadata.end.slice(5,10).replace('-','.')}  ·  最近一周`, 40, 172, 640, 19, muted);
  text(c, `${items.length} 条发布    ${items.filter(i => i.images.length).length} 条有图    ${owners.size} 位邻居`, 40, 209, 640, 19, accent, 500);
  items.forEach((item, index) => {
    const y = headerHeight + index * rowHeight, owner = owners.get(item.owner), photo = item.images[0];
    c.fillStyle = '#e8ece5'; c.fillRect(40, y - 12, 640, 1);
    const x = photo ? 204 : 40, available = photo ? 476 : 640;
    if (photo) picture(c, images.get(photo.src), 40, y + 7, 140, 152);
    const titleHeight = text(c, item.title, x, y + 5, available, 23, ink, 650, 2);
    text(c, item.desc, x, y + 9 + titleHeight, available, 16, muted, 400, titleHeight > 36 ? 1 : 2);
    text(c, price(item), x, y + 113, available - 135, 23, accent, 650);
    text(c, item.status, 548, y + 118, 132, 15, item.tone === 'gray' ? '#899087' : item.tone === 'amber' ? '#9b7536' : accent);
    picture(c, images.get(owner.avatar), x, y + 153, 23, 23, true);
    text(c, owner.nick, x + 31, y + 155, available - 155, 14, muted);
    text(c, item.date, 569, y + 155, 111, 13, muted);
  });
  if (!items.length) text(c, '本群最近一周暂无闲置发布', 40, headerHeight + 45, 640, 25, muted);
  const bottom = headerHeight + Math.max(items.length, 1) * rowHeight;
  c.fillStyle = '#f3f5ef'; c.fillRect(0, bottom, width, footerHeight);
  const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
  const qrImage = await loadImage(qr.createDataURL(5));
  c.imageSmoothingEnabled = false; c.drawImage(qrImage, 36, bottom + 33, 200, 200); c.imageSmoothingEnabled = true;
  text(c, '长按识别二维码', 261, bottom + 59, 419, 25, ink, 650);
  text(c, '查看全部图片与发布人详情', 261, bottom + 105, 419, 19, muted);
  text(c, '仅限本群分享 · 扫码直接进入', 261, bottom + 147, 419, 17, accent);
  text(c, `更新于 ${catalog.metadata.end.slice(0,16)}`, 40, bottom + 247, 640, 14, muted);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('POSTER_UNAVAILABLE');
  return new File([blob], `${group}-${catalog.metadata.end.slice(0,16).replace(/[^0-9]/g,'')}.png`, { type: 'image/png' });
}

export function resetShare() {
  generation++; currentFile = null;
  document.querySelector('#share-dialog').close();
  document.querySelector('#share-image').removeAttribute('src');
  document.querySelector('#share-download').removeAttribute('href');
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
}

export async function openShare(catalog, group) {
  resetShare(); const attempt = generation;
  const dialog = document.querySelector('#share-dialog'), status = document.querySelector('#share-status');
  const img = document.querySelector('#share-image'), download = document.querySelector('#share-download');
  const native = document.querySelector('#share-native');
  img.hidden = true; download.hidden = true; native.hidden = true;
  status.textContent = '正在生成分享长图…'; dialog.showModal();
  try {
    const response = await fetch(`/api/share?group=${group}`, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('SHARE_UNAVAILABLE');
    const { path } = await response.json();
    if (!path.startsWith(`/${group}#invite=`)) throw new Error('SHARE_INVALID');
    const file = await poster(catalog, new URL(path, location.origin).href, group);
    if (attempt !== generation) return;
    currentFile = file; objectUrl = URL.createObjectURL(file);
    img.src = objectUrl; img.hidden = false; download.href = objectUrl; download.download = file.name; download.hidden = false;
    native.hidden = !navigator.canShare?.({ files: [file] });
    status.textContent = '长按图片保存，或点击下载。二维码可直接进入本群，请仅在本群内分享。';
  } catch {
    if (attempt === generation) status.textContent = '分享图生成失败，请关闭后重试；若登录已失效，请重新进入本群。';
  }
}
document.querySelector('#share-close').onclick = resetShare;
document.querySelector('#share-dialog').addEventListener('cancel', event => { event.preventDefault(); resetShare(); });
document.querySelector('#share-native').onclick = async () => {
  if (!currentFile) return;
  try { await navigator.share({ files: [currentFile], title: document.title }); }
  catch (error) { if (error.name !== 'AbortError') document.querySelector('#share-status').textContent = '请长按图片保存，或使用下载图片按钮。'; }
};
