import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const {values} = parseArgs({options:{url:{type:'string',default:'https://xianzhi.vercel.codeforpeople.cn'},output:{type:'string',default:'.local/share'}}});
const origin = new URL(values.url).origin;
const privateRoot = resolve('.local'), output = resolve(values.output), child = relative(privateRoot, output);
if (child.startsWith('..') || isAbsolute(child)) throw new Error('分享图片必须保存在本机 .local 目录');
await mkdir(output,{recursive:true});
const {passwords} = JSON.parse(await readFile('.local/group-access.json','utf8'));
const metadata = JSON.parse(await readFile('data/metadata.json','utf8'));
const browser = await chromium.launch({channel:'msedge',headless:true});
const results = [];
try {
  const headers = {};
  if (process.env.IDLE_DEPLOYMENT_BYPASS && origin.endsWith('.vercel.app')) headers['x-vercel-protection-bypass'] = process.env.IDLE_DEPLOYMENT_BYPASS;
  for (const group of ['baolong','luanshan']) {
    const context = await browser.newContext({viewport:{width:1100,height:850},extraHTTPHeaders:headers});
    try {
      if ((await context.request.get(`${origin}/api/share?group=${group}`)).status() !== 401) throw new Error('SHARE_AUTH_REQUIRED');
      const auth = await context.request.post(`${origin}/api/access?group=${group}`,{headers:{Origin:origin},data:{password:passwords[group]}});
      if (auth.status() !== 200) throw new Error('GROUP_LOGIN_FAILED');
      const page = await context.newPage();
      await page.goto(`${origin}/${group}`);
      await page.locator('#share-button').waitFor({state:'visible'});
      const catalog = await (await context.request.get(`${origin}/api/catalog?group=${group}`)).json();
      if (catalog.metadata.end !== metadata.end || catalog.items.some(i=>i.group!==group)) throw new Error('SNAPSHOT_MISMATCH');
      await page.locator('#share-button').click();
      await page.locator('#share-download').waitFor({state:'visible',timeout:60000});
      await page.waitForFunction(()=>document.querySelector('#share-image')?.naturalWidth>0);
      await page.addScriptTag({path:'node_modules/jsqr/dist/jsQR.js'});
      // 从实际生成的长图底部识别二维码，避免仅验证编码函数返回值。
      const decoded = await page.evaluate(()=>{
        const img=document.querySelector('#share-image'), canvas=document.createElement('canvas');
        canvas.width=img.naturalWidth; canvas.height=435;
        const c=canvas.getContext('2d'); c.drawImage(img,0,img.naturalHeight-435,img.naturalWidth,435,0,0,canvas.width,435);
        const data=c.getImageData(0,0,canvas.width,435);
        return window.jsQR(data.data,data.width,data.height)?.data;
      });
      const target = new URL(decoded || 'https://invalid.example');
      if (target.origin !== origin || target.pathname !== `/${group}` || !target.hash.startsWith('#invite=')) throw new Error('QR_CODE_INVALID');
      const visitor = await browser.newContext({extraHTTPHeaders:headers});
      try {
        const scanPage = await visitor.newPage();
        await scanPage.goto(target.href);
        await scanPage.locator('#share-button').waitFor({state:'visible',timeout:45000});
        if (scanPage.url() !== `${origin}/${group}`) throw new Error('QR_FRAGMENT_NOT_CLEARED');
        const other = group === 'baolong' ? 'luanshan' : 'baolong';
        if ((await visitor.request.get(`${origin}/api/catalog?group=${other}`)).status() !== 401) throw new Error('QR_CROSS_GROUP_LEAK');
      } finally { await visitor.close(); }
      const waiting = page.waitForEvent('download'); await page.locator('#share-download').click();
      const download = await waiting, file = resolve(output,`${group}-${metadata.end.replace(/[^0-9]/g,'')}.png`);
      await download.saveAs(file);
      const bytes = await readFile(file);
      results.push({group,file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),end:metadata.end,items:catalog.items.length,qrVerified:true});
      await page.locator('#share-close').click();
      if (await page.locator('#share-image').getAttribute('src')) throw new Error('SHARE_PREVIEW_NOT_CLEARED');
    } finally { await context.close(); }
  }
  await writeFile(resolve(output,'manifest.json'),JSON.stringify({origin,end:metadata.end,posters:results},null,2)+'\n');
  console.log(JSON.stringify({result:'passed',posters:results},null,2));
} catch {
  console.error('SHARE_EXPORT_FAILED：分享图或二维码验证失败，未确认完成，请检查本机页面。');
  process.exitCode=1;
} finally { await browser.close(); }
