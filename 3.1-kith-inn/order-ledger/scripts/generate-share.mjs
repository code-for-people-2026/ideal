import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {drawShareCard,shareUrl} from '../lib/share-card.ts';

// 本地发送队列不进仓库。只有 computer-use 核验成功后才调用 --sent。
const config=JSON.parse(await readFile(process.env.ORDER_LEDGER_CONFIG??'sync.config.json','utf8'));
const directory=resolve(config.runtimeDir,'shares');await mkdir(directory,{recursive:true});
const statePath=join(directory,'delivery-state.json');
let state={seen:{},pending:[],delivered:[]};
try{state=JSON.parse(await readFile(statePath,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
async function save(){await writeFile(statePath+'.tmp',JSON.stringify(state,null,2));await rename(statePath+'.tmp',statePath)}
if(process.argv[2]==='--sent'){
  const ids=process.argv.slice(3);if(!ids.length||ids.some(id=>!state.pending.some(p=>p.id===id)))throw Error('发送记录必须对应待发送图片');
  const now=new Date().toISOString();state.delivered.push(...state.pending.filter(p=>ids.includes(p.id)).map(p=>({...p,sentAt:now})));
  state.pending=state.pending.filter(p=>!ids.includes(p.id));await save();console.log('已记录发送成功');
}else if(process.argv.length===2){
  if(!config.accessLinksFile)throw Error('请在本机 sync.config.json 配置 accessLinksFile');
  const links=JSON.parse(await readFile(config.accessLinksFile,'utf8'));
  const origin='https://duizhang.codex.codeforpeople.cn';
  if(!GlobalFonts.registerFromPath(config.shareFontPath??'C:/Windows/Fonts/msyh.ttc','Microsoft YaHei'))throw Error('无法加载分享图中文字体');
  const next=structuredClone(state);
  for(const group of ['taozi','jingjing','yuma']){
    const raw=links[group];const link=new URL(typeof raw==='string'?raw:raw?.url);
    const key=new URLSearchParams(link.hash.slice(1)).get('key');if(!key)throw Error(`${group} 缺少专属凭证`);
    const session=await fetch(origin+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({group,key}),signal:AbortSignal.timeout(30000)});
    if(!session.ok)throw Error(`${group} 访问验证失败 (${session.status})`);
    const cookie=session.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
    if(!cookie)throw Error(`${group} 缺少访问会话`);
    const response=await fetch(origin+'/api/ledger?group='+group,{headers:{Cookie:cookie},signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error(`${group} 读取失败 (${response.status})`);
    const data=await response.json();if(!Array.isArray(data.orders)||!Array.isArray(data.dates)||!Array.isArray(data.exceptions))throw Error(`${group} 数据不完整`);
    const previous=state.seen[group];const seen={};
    const dates=[...new Set([...data.dates,...Object.keys(previous??{})])].sort().reverse();
    const firstDate=dates.find(date=>data.orders.some(o=>o.date===date))??dates[0];
    for(const date of dates){
      const orders=data.orders.filter(o=>o.date===date).map(({version,confirmedAt,...o})=>o);
      const exceptions=data.exceptions.filter(e=>e.date===date);
      const digest=createHash('sha256').update(JSON.stringify({group:data.group,date,orders,exceptions})).digest('hex');seen[date]=digest;
      if(previous?previous[date]===digest:date!==firstDate)continue;
      const id=`${group}-${date}-${digest.slice(0,16)}`;
      const canvas=createCanvas(900,100);drawShareCard(canvas,data,date,shareUrl(group,date,key));
      const file=join(directory,id+'.png');await writeFile(file,canvas.toBuffer('image/png'));
      // 未发送的旧版被该日期的新图替代，其他日期的失败任务保留待重试。
      next.pending=next.pending.filter(p=>p.group!==group||p.date!==date);
      next.pending.push({id,group,date,file,createdAt:new Date().toISOString()});
    }
    next.seen[group]=seen;
  }
  state=next;await save();console.log(JSON.stringify({pending:state.pending},null,2));
}else throw Error('用法：node --experimental-strip-types scripts/generate-share.mjs [--sent 待发送ID ...]');
