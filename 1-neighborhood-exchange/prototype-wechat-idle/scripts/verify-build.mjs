import { readFile, writeFile, access, mkdir, copyFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await Promise.all(['index.html', 'app.js', 'style.css'].map(file => access(`dist/${file}`)));
execFileSync(process.execPath, ['--check', 'dist/app.js']);
execFileSync(process.execPath, ['--check', 'api/catalog.js']);
const app = await readFile('dist/app.js', 'utf8');
if (!app.includes('/api/catalog') || /fetch\(['"](?:people|items|metadata)\.json/.test(app)) throw new Error('页面尚未迁移到数据库接口');
for (const file of ['people.json', 'items.json', 'metadata.json']) {
  const exists = await access(`dist/${file}`).then(() => true, () => false);
  if (exists) throw new Error(`静态目录不应包含 ${file}`);
}
// 仅发布无敏感数据的页面外壳；照片和头像只打包进鉴权函数。
await mkdir('public', { recursive: true });
const sources = { 'index.html': 'dist/index.html', 'app.js': 'dist/app.js', 'style.css': 'dist/style.css', 'share.js': 'web/share.js', 'qrcode.js': 'node_modules/qrcode-generator/dist/qrcode.mjs' };
const allowed = Object.keys(sources);
const groups = { baolong: '🌟宝龙二手闲置交易群🌟', luanshan: '峦山美地闲置物品小市集' };
const outputFiles = [...allowed, ...Object.keys(groups).map(group => group + '.html')];
for (const file of await readdir('public')) if (!outputFiles.includes(file)) throw new Error('公开产物包含非白名单文件');
await Promise.all(allowed.map(file => copyFile(sources[file], `public/${file}`)));
const template = await readFile('dist/index.html', 'utf8');
for (const [group, name] of Object.entries(groups)) {
  await writeFile(`public/${group}.html`, template.replace('<title>群内访问</title>', `<title>${name}</title>`).replace('<h1 id="access-title">群内访问</h1>', `<h1 id="access-title">${name}</h1>`).replace('<h1 id="page-title"></h1>', `<h1 id="page-title">${name}</h1>`));
}
console.log('构建检查通过：公开目录仅含页面外壳，图片由受保护接口读取。');
