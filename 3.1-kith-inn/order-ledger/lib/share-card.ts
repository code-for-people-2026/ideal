import QRCode from 'qrcode';
import type {LedgerData} from '../app/types';

export function shareUrl(group:string,date:string,key:string){
  if(!['taozi','jingjing','yuma'].includes(group)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!key)throw Error('缺少有效的群专属链接');
  const url=new URL(`https://duizhang.codex.codeforpeople.cn/${group}/`);
  url.searchParams.set('date',date);url.hash=new URLSearchParams({key}).toString();return url.href;
}

// 浏览器分享与每日同步图片共用排版，原始数据和二维码均在本地渲染。
export function drawShareCard(canvas:HTMLCanvasElement,data:LedgerData,date:string,url:string){
  canvas.width=900;canvas.height=100;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('当前设备无法生成图片');
  const operations:(()=>void)[]=[];let y=54;
  const font=(size:number,weight=400)=>`${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
  const text=(value:string,size=27,color='#344054',weight=400,width=788)=>{
    ctx.font=font(size,weight);const lines:string[]=[];
    for(const paragraph of value.split('\n')){
      let line='';for(const char of Array.from(paragraph)){
        if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char}else line+=char;
      }lines.push(line);
    }
    for(const line of lines){const top=y;operations.push(()=>{ctx.font=font(size,weight);ctx.fillStyle=color;ctx.fillText(line,56,top)});y+=Math.ceil(size*1.6)}
  };
  const rule=()=>{const top=y;operations.push(()=>{ctx.fillStyle='#e8ecf1';ctx.fillRect(56,top,788,2)});y+=30};
  text('每日对账  /  订单与收款',23,'#245bdd',600);y+=20;
  text(data.group,44,'#142238',700);y+=10;
  text(date.replace(/^(\d+)-(\d+)-(\d+)$/,'$1年$2月$3日'),28,'#52637a');y+=25;
  const orders=data.orders.filter(o=>o.date===date),done=orders.filter(o=>o.manual||o.payment==='paid');
  const money=(value:number)=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(value);
  text(`${orders.length} 笔订单   ·   已核对 ${done.length} 笔   ·   待核对 ${orders.length-done.length} 笔`,28,'#142238',600);
  text(`已知应收 ¥${money(orders.reduce((n,o)=>n+(o.amount??0),0))}  /  已核对 ¥${money(done.reduce((n,o)=>n+(o.amount??0),0))}`,26);
  const unknown=orders.filter(o=>o.amount===null).length;if(unknown)text(`另有 ${unknown} 笔金额待核实`,23,'#986314');
  y+=24;rule();
  if(!orders.length){text('该日期暂无已同步的订单记录。');y+=28;}
  orders.forEach((o,i)=>{
    text(`${i+1}. ${o.customer}   ·   ${o.quantity}`,31,'#142238',600);
    if(o.location)text(o.location,23,'#738097');
    text(o.item,26);y+=6;
    const label=o.manual?'群主已确认':({paid:'群内已收款',sent:'已转账 · 待收款',redpacket:'红包 · 待核金额',none:'未见群内付款'}[o.payment]);
    text(`${o.amount===null?'金额待核实':`¥${money(o.amount)}`}   ·   ${label}`,25,o.manual||o.payment==='paid'?'#16704e':'#805a20',500);
    if(o.note)text(o.note,23,'#6a7789');
    y+=24;rule();
  });
  const notes=data.exceptions.filter(n=>n.date===date);
  if(notes.length){text('需要留意',28,'#142238',600);for(const note of notes)text('· '+note.text,24,'#6a7789');y+=20;}
  text('“未见群内付款”不代表欠款。人工确认以群主核实为准。',23,'#738097');
  const synced=new Date(data.syncedAt??data.snapshot);
  if(!Number.isNaN(synced.getTime()))text('同步于 '+new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'short',hourCycle:'h23'}).format(synced)+'（北京时间）',22,'#738097');
  y+=36;const footer=y;const qr=QRCode.create(url,{errorCorrectionLevel:'M'});const unit=Math.floor(288/(qr.modules.size+8));const qrSize=(qr.modules.size+8)*unit;
  const height=footer+qrSize+96;if(height>16000)throw Error('该日期订单太多，暂时无法生成单张长图');
  canvas.height=height;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,900,height);ctx.textBaseline='top';operations.forEach(draw=>draw());
  ctx.fillStyle='#f5f7fb';ctx.fillRect(0,footer-12,900,height-footer+12);
  const qrX=56,qrY=footer+30;ctx.fillStyle='#fff';ctx.fillRect(qrX,qrY,qrSize,qrSize);ctx.fillStyle='#142238';
  for(let row=0;row<qr.modules.size;row++)for(let col=0;col<qr.modules.size;col++)if(qr.modules.get(row,col))ctx.fillRect(qrX+(col+4)*unit,qrY+(row+4)*unit,unit,unit);
  ctx.fillStyle='#142238';ctx.font=font(30,600);ctx.fillText('长按识别二维码',380,qrY+56);ctx.font=font(25);ctx.fillText('查看当天完整对账',380,qrY+106);
  ctx.font=font(21);ctx.fillStyle='#738097';ctx.fillText('群专属访问 · 请仅分享给群主',380,qrY+164);
  return canvas;
}
