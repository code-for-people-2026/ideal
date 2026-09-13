import {cookies} from 'next/headers';
import {getGroup} from '../../../lib/groups';
import {sign,validKey} from '../../../lib/auth';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'请求来源不符'},{status:403});
 let body;try{body=await req.json()}catch{return Response.json({error:'无效请求'},{status:400})}
 if(typeof body.group!=='string'||!getGroup(body.group)||typeof body.key!=='string'||body.key.length>256||!validKey(body.group,body.key))return Response.json({error:'无效链接'},{status:401});
 const expires=Date.now()+30*86400000;
 (await cookies()).set(`ledger_${body.group}`,`${expires}.${sign(body.group,expires)}`,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:30*86400});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
