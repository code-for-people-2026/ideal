export const stateKey = group => `kith-order-ledger:v1:${group}`;
export function parseState(raw) {
  if (!raw) return {};
  const value = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("保存的记录格式不正确");
  for (const [id, row] of Object.entries(value)) {
    if (!row || typeof row.confirmed !== "boolean" || typeof row.updatedAt !== "string" || id.length > 100) throw new Error("保存的记录格式不正确");
  }
  return value;
}
export const isPaid = (order, state) => order.payment === "paid" || state[order.id]?.confirmed === true;
export function summary(orders, state) {
  const done = orders.filter(o => isPaid(o, state));
  return { count: orders.length, done: done.length, pending: orders.length-done.length,
    total: orders.reduce((s,o)=>s+(o.amount??0),0), confirmed: done.reduce((s,o)=>s+(o.amount??0),0), unknown: orders.filter(o=>o.amount===null).length };
}
export function setConfirmed(storage, group, order, confirmed, now = new Date().toISOString()) {
  if (order.payment === "paid") throw new Error("已有群内收款回执，不能手动修改");
  const key=stateKey(group),current=parseState(storage.getItem(key));
  const next={...current,[order.id]:{confirmed,updatedAt:now}};
  storage.setItem(key,JSON.stringify(next));
  return next;
}
export function decodeBase64(value) { return Uint8Array.from(atob(value.replaceAll("-","+").replaceAll("_","/")), x=>x.charCodeAt(0)); }
export async function decryptSnapshot(envelope, rawKey, group) {
  if (envelope.algorithm!=="AES-GCM"||envelope.version!==1) throw new Error("订单文件格式不支持");
  const key=await crypto.subtle.importKey("raw",decodeBase64(rawKey),"AES-GCM",false,["decrypt"]);
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:decodeBase64(envelope.iv),additionalData:new TextEncoder().encode(group)},key,decodeBase64(envelope.data));
  const data=JSON.parse(new TextDecoder().decode(plain));
  if (!data.group||!Array.isArray(data.orders)||!Array.isArray(data.dates)) throw new Error("订单数据不完整");
  return data;
}
