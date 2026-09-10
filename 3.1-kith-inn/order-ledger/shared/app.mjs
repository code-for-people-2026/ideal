import {stateKey,parseState,isPaid,summary,setConfirmed,decryptSnapshot} from "./model.mjs";
const app=document.querySelector("#app"),group=document.body.dataset.group;
let data,state={},date,error="",notice="",storageAvailable=true;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat("zh-CN",{maximumFractionDigits:2}).format(n);
function readState(){try{state=parseState(localStorage.getItem(stateKey(group)));storageAvailable=true}catch{storageAvailable=false;error="无法读取本浏览器的对账记录。请允许网站存储；已有记录异常时请先保留备份，不要清除浏览器数据。"}}
function status(o){const manual=state[o.id]?.confirmed===true&&o.payment!=="paid",kind=manual?"manual":o.payment;const labels={paid:"群内已收款",manual:"群主已确认",sent:"已转账 · 待收款",redpacket:"红包 · 待核金额",none:"未见群内付款"};return `<div><span class="status ${kind}">${isPaid(o,state)?"✓ ":""}${labels[kind]}</span>${manual?`<div class="status-note">原记录：${labels[o.payment]}</div>`:""}</div>`}
function action(o){if(o.payment==="paid")return '<span class="status-note">已有收款回执</span>';const confirmed=state[o.id]?.confirmed===true;return `<button type="button" class="${confirmed?"undo":"confirm"}" data-order="${esc(o.id)}" data-confirm="${!confirmed}" ${storageAvailable?"":"disabled"} aria-label="${confirmed?"撤销":"手动确认"}${esc(o.customer)}的付款">${confirmed?"撤销确认":"✓ 手动确认已付"}</button>`}
function render(){
 const orders=data.orders.filter(o=>o.date===date),s=summary(orders,state),notes=data.exceptions.filter(e=>e.date===date);
 document.title=data.group+" · 每日对账";
 app.setAttribute("aria-busy","false");
 app.innerHTML=`<div class="topline"><span class="mark">账</span><span>街坊味 · 每日对账</span></div><h1>${esc(data.group)}</h1>
 <div class="datebar"><div class="date-tabs" role="group" aria-label="选择日期">${data.dates.map(d=>`<button type="button" class="date-tab" data-date="${d}" aria-pressed="${d===date}">${Number(d.slice(5,7))}月${Number(d.slice(8))}日</button>`).join("")}</div><span class="live">微信记录截至 ${esc(data.snapshot)}</span></div>
 <p class="storage-note">手动确认保存在当前浏览器，刷新后保留；不同手机、浏览器之间不会自动同步。</p>
 ${error?`<div class="error" role="alert">${esc(error)}</div>`:""}<div class="sr-only" role="status" aria-live="polite">${esc(notice)}</div>
 <div class="stats"><div class="stat"><span class="label">当天订单</span><strong>${s.count}<span class="unit">笔</span></strong></div><div class="stat"><span class="label">已知应收金额</span><strong>¥${money(s.total)}</strong>${s.unknown?`<div class="subtitle">另${s.unknown}笔金额待核</div>`:""}</div><div class="stat done"><span class="label">已核对订单金额</span><strong>¥${money(s.confirmed)}</strong><div class="subtitle">群内已收或手动确认</div></div><div class="stat ${s.pending?"pending":"done"}"><span class="label">待核对订单</span><strong>${s.pending}<span class="unit">笔</span></strong></div></div>
 ${s.count?`<div class="reconcile ${s.pending===0?"complete":""}"><span class="reconcile-icon">${s.pending===0?"✓":"☷"}</span><div><strong>${s.pending===0?"当天订单对账完成":`已核对 ${s.done} / ${s.count} 笔订单`}</strong><p>${s.pending===0?"所有订单均已确认付款。":"核实私聊转账、红包或现金收款后，点击「手动确认已付」。"}</p></div></div>`:""}
 <div class="section-head"><h2>下单客户</h2><span class="subtitle">${date.replaceAll("-",".")}</span></div>
 ${orders.length?`<div class="panel"><div class="desktop-orders"><table class="order-table"><thead><tr><th scope="col">客户昵称</th><th scope="col">商品 · 分量</th><th scope="col">应收</th><th scope="col">付款 / 对账状态</th><th scope="col">操作</th></tr></thead><tbody>${orders.map(o=>`<tr><td><div class="name">${esc(o.customer)}</div><div class="location">${esc(o.location||"未注明房号")}</div></td><td><div class="item">${esc(o.item)} · ${esc(o.quantity)}<small>${esc(o.note)}</small></div></td><td class="amount">${o.amount===null?"待核实":`¥${money(o.amount)}`}</td><td>${status(o)}</td><td>${action(o)}</td></tr>`).join("")}</tbody></table></div>
 <div class="mobile-orders">${orders.map(o=>`<article class="order-card"><div class="card-top"><div><div class="name">${esc(o.customer)}</div><div class="location">${esc(o.location||"未注明房号")}</div></div><span class="amount">${o.amount===null?"金额待核":`¥${money(o.amount)}`}</span></div><div class="card-items item">${esc(o.item)} · ${esc(o.quantity)}<small>${esc(o.note)}</small></div><div class="card-bottom">${status(o)}${action(o)}</div></article>`).join("")}</div></div>`:'<div class="panel empty">当天没有可确认的订单记录。</div>'}
 <p class="footnote">未见群内付款不代表欠款。手动确认只更新本页记录，不操作微信或资金。清除浏览器数据会丢失手动确认，请保留使用此页的浏览器。</p>
 ${notes.length?`<section class="exceptions"><h2>另有这些记录需要留意</h2>${notes.map(n=>`<div class="exception">${esc(n.text)}</div>`).join("")}</section>`:""}`;
}
app.addEventListener("click",event=>{const button=event.target.closest("button");if(!button)return;if(button.dataset.date){date=button.dataset.date;notice="";render();app.querySelector(`[data-date="${date}"]`)?.focus();return}const o=data?.orders.find(o=>o.id===button.dataset.order);if(!o)return;
 const confirmed=button.dataset.confirm==="true";
 try{state=setConfirmed(localStorage,group,o,confirmed);error="";notice=`${o.customer}：${confirmed?"已确认付款":"已撤销手动确认"}`;}catch{error="保存失败，付款状态没有更改。请检查浏览器是否允许本地存储。"}
 render();const container=window.matchMedia("(max-width:760px)").matches?".mobile-orders":".desktop-orders";app.querySelector(`${container} [data-order="${o.id}"]`)?.focus();
});
window.addEventListener("storage",event=>{if(data&&(event.key===stateKey(group)||event.key===null)){readState();render()}});
async function start(){
 const params=new URLSearchParams(location.hash.slice(1));let key=params.get("key");
 try{key=key||sessionStorage.getItem(`ledger-key:${group}`)}catch{}
 if(!key){app.setAttribute("aria-busy","false");app.innerHTML='<section class="login"><div class="mark">账</div><h1>请使用群主的完整专属链接</h1><p>这份订单已加密。请打开包含解锁信息的完整链接；普通页面地址无法查看客户名单。</p></section>';return}
 try{const response=await fetch("./snapshot.json",{cache:"no-cache"});if(!response.ok)throw Error("fetch");const envelope=await response.json();data=await decryptSnapshot(envelope,key,group);try{sessionStorage.setItem(`ledger-key:${group}`,key)}catch{}date=data.dates.at(-1);readState();render();}catch{app.setAttribute("aria-busy","false");app.innerHTML='<section class="login"><h1>暂时无法解锁订单</h1><p>请检查网络，并确认使用的是此群的完整专属链接。其他群的链接不能解锁本页。</p><button class="confirm" type="button" id="retry">重试</button></section>';document.querySelector("#retry").addEventListener("click",start)}
}
void start();
