import { openShare, resetShare } from '/share.js';
const groups = {baolong:'🌟宝龙二手闲置交易群🌟',luanshan:'峦山美地闲置物品小市集'};
const shortGroups = {baolong:'宝龙群',luanshan:'峦山美地群'};
const pathGroup = location.pathname.replaceAll('/', '');
const activeGroup = Object.hasOwn(groups, pathGroup) ? pathGroup : null;
const assetUrl = path => '/api/media?group=' + activeGroup + '&file=' + encodeURIComponent(path);
document.title = groups[activeGroup] || '群内访问';
document.querySelector('#page-title').textContent = groups[activeGroup] || '';
document.querySelector('#access-title').textContent = groups[activeGroup] || '群内访问';
if (activeGroup) document.querySelector('#access-copy').textContent = '输入本群密码，查看物品照片与发布人。';
const dialog = document.querySelector('#detail');
let people = new Map();
let currentCatalog = null;
document.querySelector('#share-button').onclick = () => { if (currentCatalog) openShare(currentCatalog, activeGroup); };
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
function avatar(p, small = false) {
  const n = el('img', small ? 'mini-avatar' : 'avatar');
  n.src = assetUrl(p.avatar);
  n.alt = small ? '' : `${p.nick}的微信头像`;
  n.loading = 'lazy';
  n.addEventListener('error', () => {
    const fallback = el('span', `${small ? 'mini-avatar' : 'avatar'} avatar-fallback`, Array.from(p.nick)[0]);
    if (!small) fallback.setAttribute('aria-label', `${p.nick}的头像暂时无法加载`);
    n.replaceWith(fallback);
  }, {once:true});
  return n;
}
function priceNode(item) {
  const n = el('div', 'price');
  if (item.priceLabel || item.price === null || item.price === 0) {
    n.classList.add('text');
    n.textContent = item.priceLabel || (item.price === 0 ? '免费赠送' : '价格未说明');
  } else {
    n.append(el('small', '', '¥'), document.createTextNode(String(item.price)));
    if (item.unit) n.append(el('span', 'unit', item.unit));
  }
  return n;
}
const statusNode = item => el('span', `status ${item.tone || ''}`, item.status);
function show(item) {
  const p = people.get(item.owner);
  const root = el('div', 'detail-inner');
  const profile = el('div', 'profile');
  const name = el('div');
  name.append(el('p', '', '发布人的微信昵称'), el('h3', '', p.nick));
  profile.append(avatar(p), name);
  const heading = el('div', 'detail-heading');
  const title = el('h2', '', item.title);
  title.id = 'detail-title';
  heading.append(title, priceNode(item));
  const meta = el('div', 'detail-meta');
  meta.append(statusNode(item), el('time', '', item.date));
  root.append(profile, el('p', 'detail-group', groups[item.group]), heading, meta);
  if (item.images.length) {
    const gallery = el('div', 'gallery');
    const img = el('img', 'gallery-image');
    const caption = el('p', 'image-caption');
    let index = 0;
    const counter = el('span');
    counter.setAttribute('aria-live', 'polite');
    const render = () => {
      const photo = item.images[index];
      img.src = assetUrl(photo.src);
      img.alt = `${item.title}，第 ${index + 1} 张发布图`;
      img.width = photo.width;
      img.height = photo.height;
      img.classList.toggle('thumbnail', photo.thumbnail);
      caption.textContent = photo.thumbnail ? '本地仅保留缩略图，放大后清晰度有限。' : '来自发布人的原消息。';
      counter.textContent = `${index + 1} / ${item.images.length}`;
    };
    render();
    gallery.append(img);
    if (item.images.length > 1) {
      const controls = el('div', 'gallery-controls');
      for (const [label, delta] of [['上一张', -1], ['下一张', 1]]) {
        const b = el('button', '', label);
        b.type = 'button';
        b.onclick = () => { index = (index + delta + item.images.length) % item.images.length; render(); };
        if (delta < 0) controls.append(b, counter); else controls.append(b);
      }
      gallery.append(controls);
    }
    gallery.append(caption);
    root.append(gallery);
  } else {
    root.append(el('div', 'no-image-note', '原消息没有附图，以下内容根据群内文字及回复整理。'));
  }
  root.append(el('p', 'detail-description', item.desc));
  if (item.events.length) {
    const timeline = el('ol', 'timeline');
    for (const [time, description] of item.events) {
      const li = el('li');
      li.append(el('time', '', time), el('span', '', description));
      timeline.append(li);
    }
    root.append(timeline);
  }
  root.append(el('p', 'detail-note', item.note));
  root.append(el('p', 'detail-note', `请在“${groups[item.group]}”中按昵称和发布时间找到原消息。头像、昵称可能与当前资料不同。`));
  document.querySelector('#detail-content').replaceChildren(root);
  dialog.showModal();
  dialog.scrollTop = 0;
}
function card(item) {
  const p = people.get(item.owner);
  const b = el('button', 'card');
  b.type = 'button';
  b.dataset.itemId = item.id;
  b.setAttribute('aria-label', `${item.title}，${item.status}，查看${p.nick}的发布详情`);
  const frame = el('div', 'photo-frame');
  const photo = item.images[0];
  const img = el('img');
  img.src = assetUrl(photo.src);
  img.alt = item.title;
  img.width = photo.width;
  img.height = photo.height;
  img.loading = 'lazy';
  frame.append(img);
  if (item.images.length > 1) frame.append(el('span', 'photo-count', `${item.images.length} 张图`));
  if (photo.thumbnail) frame.append(el('span', 'quality', '缩略图'));
  const body = el('div', 'card-body');
  const priceLine = el('div', 'card-price-line');
  priceLine.append(priceNode(item), statusNode(item));
  body.append(el('span', 'category', item.category), el('h3', '', item.title), el('p', 'card-desc', item.desc), priceLine);
  const bottom = el('div', 'card-bottom');
  bottom.append(avatar(p, true), el('span', 'publisher', p.nick), el('time', 'date', item.date));
  b.append(frame, body, bottom);
  b.onclick = () => show(item);
  return b;
}
function row(item) {
  const p = people.get(item.owner);
  const b = el('button', 'compact-row');
  b.type = 'button';
  b.dataset.itemId = item.id;
  b.setAttribute('aria-label', `${item.title}，${item.status}，查看${p.nick}的发布详情`);
  const body = el('div');
  const info = el('div', 'row-info');
  info.append(el('span', '', `${shortGroups[item.group]} · ${p.nick}`), el('time', '', item.date));
  body.append(el('p', 'row-title', item.title), info);
  const owner = el('div', 'row-owner');
  owner.append(avatar(p, true), el('span', '', p.nick));
  const end = el('div', 'row-end');
  end.append(priceNode(item), statusNode(item));
  b.append(body, owner, end, el('span', 'arrow', '›'));
  b.onclick = () => show(item);
  return b;
}
document.querySelector('#close').onclick = () => dialog.close();
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
let loading = false;
function lock() {
  resetShare();
  currentCatalog = null;
  document.querySelector('#share-button').hidden = true;
  dialog.close();
  people.clear();
  for (const id of ['group-items', 'text-items', 'detail-content']) document.querySelector('#' + id).replaceChildren();
  document.querySelector('#catalog-content').hidden = true;
  document.querySelector('#access-panel').hidden = false;
  document.querySelector('#access-form').hidden = !activeGroup;
  document.querySelector('#logout').hidden = true;
  document.querySelector('#private-label').hidden = false;
}
async function unlockWithPassword(password, invite) {
  const button = document.querySelector('#unlock');
  const input = document.querySelector('#group-password');
  const error = document.querySelector('#access-error');
  error.textContent = '';
  button.disabled = true;
  button.textContent = '正在验证…';
  try {
    const response = await fetch('/api/access?group=' + activeGroup, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invite !== undefined ? { invite } : { password }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      error.textContent = response.status === 401 ? '密码不正确，请使用本群的访问密码。' : response.status === 429 ? '尝试次数过多，请 15 分钟后再试。' : '暂时无法验证，请稍后重试。';
      return;
    }
    input.value = '';
    await init();
  } catch { error.textContent = '暂时无法连接，请稍后重试。'; }
  finally { button.disabled = false; button.textContent = '进入本群闲置'; }
}
document.querySelector('#access-form').addEventListener('submit', event => {
  event.preventDefault();
  unlockWithPassword(document.querySelector('#group-password').value);
});
document.querySelector('#logout').onclick = async () => {
  try {
    const response = await fetch('/api/access?group=' + activeGroup, { method: 'DELETE', credentials: 'same-origin', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('LOGOUT_FAILED');
    lock();
  } catch { document.querySelector('#load-status').textContent = '退出失败，请稍后重试。'; }
};
async function loadCatalog() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`/api/catalog?group=${activeGroup}`, { cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(12000) });
      if (!response.ok) {
        const error = new Error('CATALOG_REQUEST_FAILED');
        error.auth = response.status === 401 || response.status === 403;
        throw error;
      }
      const catalog = await response.json();
      if (!Array.isArray(catalog.people) || !Array.isArray(catalog.items) || catalog.metadata?.account !== '司徒比特' || (!catalog.items.length && catalog.metadata.captureComplete !== true)) throw new Error('CATALOG_INVALID');
      const owners = new Set(catalog.people.map(p => p.id));
      if (catalog.items.some(item => !owners.has(item.owner) || item.group !== activeGroup || !Array.isArray(item.images))) throw new Error('CATALOG_INVALID');
      return catalog;
    } catch (error) {
      if (error.auth || attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}
async function init() {
  if (!activeGroup) { lock(); return; }
  if (loading) return;
  loading = true;
  const load = document.querySelector('#load-status');
  load.textContent = '正在加载物品…';
  load.setAttribute('aria-busy', 'true');
  try {
    const { people: profiles, items, metadata } = await loadCatalog();
    currentCatalog = { people: profiles, items, metadata };
    document.querySelector('#share-button').hidden = false;
    document.querySelector('#access-panel').hidden = true;
    document.querySelector('#catalog-content').hidden = false;
    document.querySelector('#logout').hidden = false;
    document.querySelector('#private-label').hidden = true;
    people = new Map(profiles.map(p => [p.id, p]));
    document.querySelector('#date-range').textContent = `${metadata.start.slice(0, 10).replaceAll('-', '.')} — ${metadata.end.slice(0, 10).replaceAll('-', '.')}`;
    document.querySelector('#updated-at').textContent = `数据截至 ${metadata.end.slice(0, 16)}（北京时间），每日凌晨 2 点检查更新。`;
    document.querySelector('#photo-card-count').textContent = items.filter(i => i.images.length).length;
    document.querySelector('#photo-count').textContent = items.reduce((count, item) => count + item.images.length, 0);
    document.querySelector('#publisher-count').textContent = new Set(items.map(item => item.owner)).size;
    document.querySelector('#text-count').textContent = `${items.filter(i => !i.images.length).length} 条`;
    document.querySelector('#group-count').textContent = `${items.filter(i => i.images.length).length} 条`;
    const briefTime = value => value.slice(5, 16).replace('-', '/');
    const range = group => metadata.groups[group].earliest && metadata.groups[group].latest ? `${briefTime(metadata.groups[group].earliest)} 至 ${briefTime(metadata.groups[group].latest)}` : '本周暂无消息';
    document.querySelector('#source-note').textContent = `来源：${metadata.account}。${shortGroups[activeGroup]}可读记录 ${range(activeGroup)}。仅整理本群最近一周的记录，时间均为北京时间，转让状态以发布人最新回复为准。`;
    const content = { group: document.createDocumentFragment(), text: document.createDocumentFragment() };
    for (const item of items.filter(i => i.images.length)) content.group.append(card(item));
    for (const item of items.filter(i => !i.images.length).sort((a, b) => b.date.localeCompare(a.date))) content.text.append(row(item));
    for (const [group, fragment] of Object.entries(content)) {
      document.querySelector(`#${group}-items`).replaceChildren(fragment);
    }
    document.querySelector('.text-section').hidden = !items.some(item => !item.images.length);
    document.querySelector('.group-section').hidden = !items.some(item => item.images.length);
    load.textContent = items.length ? '' : '本群最近一周暂无可展示的闲置物品。';
  } catch (error) {
    if (error.auth) { lock(); return; }
    document.querySelector('#access-panel').hidden = true;
    document.querySelector('#catalog-content').hidden = false;
    load.textContent = '暂时无法连接物品列表，请稍后重试。';
    const retry = el('button', 'retry-button', '重新加载');
    retry.type = 'button';
    retry.onclick = init;
    load.append(retry);
    console.error(error.auth ? 'CATALOG_AUTH_REQUIRED' : 'CATALOG_LOAD_FAILED');
  } finally {
    loading = false;
    load.removeAttribute('aria-busy');
  }
}
async function openPage() {
  const parameters = new URLSearchParams(location.hash.slice(1));
  if (!parameters.has('password') && !parameters.has('invite')) { await init(); return; }
  const password = parameters.get('password');
  const invite = parameters.has('invite') ? parameters.get('invite') : undefined;
  parameters.delete('password');
  parameters.delete('invite');
  // 分享密码只在片段中传递，验证前清除地址栏及当前历史条目。
  history.replaceState(null, '', location.pathname + location.search + (parameters.size ? '#' + parameters.toString() : ''));
  lock();
  if (activeGroup) await unlockWithPassword(password, invite);
}
openPage();
window.addEventListener('hashchange', openPage);
window.addEventListener('pageshow', event => { if (event.persisted) { lock(); init(); } });
