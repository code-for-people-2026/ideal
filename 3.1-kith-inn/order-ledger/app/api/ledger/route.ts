import {z} from 'zod';
import {authorized} from '../../../lib/auth';
import {getGroup} from '../../../lib/groups';
import {database} from '../../../lib/db';
import type {Order} from '../../types';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 const group=getGroup(new URL(req.url).searchParams.get('group'));if(!group)return json({error:'没有这个群'},404);
 if(!await authorized(group.slug))return json({error:'请使用完整专属链接'},401);
 try{
  const sql=database();const days=await sql`SELECT date::text,data,snapshot_at FROM ledger_days WHERE group_id=${group.slug} ORDER BY date`;
  const confirmations=await sql`SELECT order_id,confirmed,version,updated_at,basis FROM ledger_confirmations WHERE group_id=${group.slug}`;
  const map=new Map(confirmations.map(c=>[c.order_id,c]));
  const orders=days.flatMap(day=>day.data.orders).map((o:Order)=>{const c=map.get(o.id);const matches=c?.basis?.item===o.item&&c?.basis?.quantity===o.quantity&&c?.basis?.amount===o.amount;return {...o,manual:o.payment!=='paid'&&!!c?.confirmed&&matches,version:c?.version??0,confirmedAt:c?.updated_at??null,note:o.note+(c?.confirmed&&!matches?'；订单内容已变化，请重新核对原人工确认。':'')}});
  const snapshot=days.reduce((latest,d)=>d.snapshot_at>latest?d.snapshot_at:latest,'');
  const sync=await sql`SELECT synced_at FROM ledger_sync_status WHERE group_id=${group.slug}`;
  return json({group:group.name,dates:days.map(d=>d.date),snapshot,syncedAt:sync[0]?.synced_at??null,orders,exceptions:days.flatMap(d=>d.data.exceptions)});
 }catch{return json({error:'暂时无法读取云端记录，请稍后重试'},503)}
}
export async function POST(req:Request){
 const group=getGroup(new URL(req.url).searchParams.get('group'));if(!group)return json({error:'没有这个群'},404);
 if(!await authorized(group.slug))return json({error:'请使用完整专属链接'},401);
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'请求来源不符'},403);
 let body;try{body=await req.json()}catch{return json({error:'无效请求'},400)}
 const parsed=z.object({orderId:z.string().min(1).max(300),confirmed:z.boolean(),version:z.number().int().min(0)}).safeParse(body);
 if(!parsed.success)return json({error:'请求参数不正确'},400);
 const {orderId,confirmed,version}=parsed.data;
 try{
  const sql=database();
  // 只允许本群现存、没有群内收款回执的订单；版本条件防止覆盖其他设备刚完成的核对。
  const result=await sql`INSERT INTO ledger_confirmations(group_id,order_id,confirmed,version,updated_at,basis)
    SELECT ${group.slug},${orderId},${confirmed},1,now(),jsonb_build_object('item',o->'item','quantity',o->'quantity','amount',o->'amount')
    FROM ledger_days d CROSS JOIN LATERAL jsonb_array_elements(d.data->'orders') o
    WHERE d.group_id=${group.slug} AND o->>'id'=${orderId} AND o->>'payment'<>'paid'
      AND (${version}=0 OR EXISTS(SELECT 1 FROM ledger_confirmations WHERE group_id=${group.slug} AND order_id=${orderId}))
    ON CONFLICT(group_id,order_id) DO UPDATE SET confirmed=EXCLUDED.confirmed,version=ledger_confirmations.version+1,updated_at=now(),basis=EXCLUDED.basis
    WHERE ledger_confirmations.version=${version} RETURNING version,updated_at`;
  if(!result.length)return json({error:'订单状态已变化，请刷新后重试'},409);
  return json({orderId,manual:confirmed,version:result[0].version,confirmedAt:result[0].updated_at});
 }catch{return json({error:'保存失败，付款状态尚未更改'},503)}
}
