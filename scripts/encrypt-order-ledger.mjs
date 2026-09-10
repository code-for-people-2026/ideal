import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,dirname,relative,isAbsolute} from "node:path";
import {fileURLToPath} from "node:url";
import {randomBytes,createCipheriv} from "node:crypto";
// 明文输入与解锁链接留在仓库外，仓库仅保存加密快照。
const [inputDirectory,linksFile]=process.argv.slice(2);
if(!inputDirectory||!linksFile)throw Error("用法：node scripts/encrypt-order-ledger.mjs 明文数据目录 仓库外链接文件");
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
for(const p of [inputDirectory,linksFile]){const rel=relative(root,resolve(p));if(!rel.startsWith("..")&&!isAbsolute(rel))throw Error("明文和解锁链接必须位于仓库外");}
const groups={tao:"taozi",jing:"jingjing",yu:"yuma"},links={};
for(const [source,group] of Object.entries(groups)){
 const plain=await readFile(resolve(inputDirectory,`${source}.json`));JSON.parse(plain.toString());
 const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);cipher.setAAD(Buffer.from(group));
 const encrypted=Buffer.concat([cipher.update(plain),cipher.final(),cipher.getAuthTag()]);
 const envelope={version:1,algorithm:"AES-GCM",iv:iv.toString("base64"),data:encrypted.toString("base64")};
 const output=resolve(root,`3.1-kith-inn/order-ledger/${group}/snapshot.json`);
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(envelope));
 links[source]={group,key:key.toString("base64url"),url:`https://ideal.codeforpeople.cn/kith-inn/order-ledger/${group}/#key=${key.toString("base64url")}`};
}
await mkdir(dirname(resolve(linksFile)),{recursive:true});await writeFile(linksFile,JSON.stringify(links,null,2),{mode:0o600});
console.log("已生成三个加密快照；专属链接已写入指定的仓库外文件。");
