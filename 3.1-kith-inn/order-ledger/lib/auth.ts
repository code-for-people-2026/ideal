import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
const same=(a:string,b:string)=>a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function validKey(group:string,key:string){
 const keys=JSON.parse(process.env.LEDGER_KEY_HASHES||'{}');
 return typeof keys[group]==='string'&&same(createHash('sha256').update(key).digest('hex'),keys[group]);
}
export function sign(group:string,expiry:number){
 if(!process.env.SESSION_SECRET)throw Error('缺少会话配置');
 return createHmac('sha256',process.env.SESSION_SECRET).update(`${group}:${expiry}`).digest('hex');
}
export async function authorized(group:string){
 const value=(await cookies()).get(`ledger_${group}`)?.value;
 if(!value)return false;
 const [expires,signature]=value.split('.');const expiry=Number(expires);
 return Number.isSafeInteger(expiry)&&expiry>Date.now()&&!!signature&&same(sign(group,expiry),signature);
}
