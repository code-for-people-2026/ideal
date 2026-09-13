import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {neon} from '@neondatabase/serverless';
const sql=neon(process.env.DATABASE_URL);
// 独立测试 schema，仅使用虚构订单，不更改正式订单或对账记录。
await sql`CREATE SCHEMA IF NOT EXISTS ledger_verify`;
try{
 await sql`CREATE TABLE ledger_verify.ledger_days (LIKE public.ledger_days INCLUDING ALL)`;
 await sql`CREATE TABLE ledger_verify.ledger_confirmations (LIKE public.ledger_confirmations INCLUDING ALL)`;
 const source=await readFile(new URL('../app/api/ledger/route.ts',import.meta.url),'utf8');
 const template=source.match(/const result=await sql`([\s\S]*?)`;/)[1].replaceAll('ledger_confirmations','ledger_verify.ledger_confirmations').replaceAll('ledger_days','ledger_verify.ledger_days');
 const confirm=new Function('sql','group','orderId','confirmed','version',`return sql\`${template}\``);
 const data={orders:[{id:'test-order',item:'测试商品',quantity:'1份',amount:30,payment:'none'}],exceptions:[]};
 await sql`INSERT INTO ledger_verify.ledger_days VALUES ('taozi','2026-09-12','2026-09-12T01:00:00+08:00',${JSON.stringify(data)}::jsonb,now())`;
 assert.equal((await confirm(sql,{slug:'jingjing'},'test-order',true,0)).length,0);
 let r=await confirm(sql,{slug:'taozi'},'test-order',true,0);assert.equal(r[0].version,1);
 assert.equal((await confirm(sql,{slug:'taozi'},'test-order',false,0)).length,0);
 assert.equal((await confirm(sql,{slug:'taozi'},'test-order',false,1))[0].version,2);
 assert.equal((await confirm(sql,{slug:'taozi'},'test-order',true,2))[0].version,3);
 data.orders[0].quantity='2份';data.orders[0].amount=60;
 await sql`UPDATE ledger_verify.ledger_days SET data=${JSON.stringify(data)}::jsonb`;
 r=await sql`SELECT confirmed,basis,version FROM ledger_verify.ledger_confirmations`;
 assert.equal(r[0].confirmed,true);assert.equal(r[0].basis.quantity,'1份');assert.equal(r[0].version,3);
 data.orders[0].payment='paid';await sql`UPDATE ledger_verify.ledger_days SET data=${JSON.stringify(data)}::jsonb`;
 assert.equal((await confirm(sql,{slug:'taozi'},'test-order',false,3)).length,0);
 console.log('PASS: 群隔离、保存、撤销、并发版本、导入保留人工记录、订单变更依据、收款回执不可覆盖');
}finally{await sql`DROP SCHEMA ledger_verify CASCADE`}
