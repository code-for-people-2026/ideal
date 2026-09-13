"""只采集指定微信账号的三个群，输出本地 JSON，不写数据库。"""
from pathlib import Path
from datetime import datetime,timedelta,timezone
import json,os,subprocess,argparse

from sync_config import load_sync_config
parser=argparse.ArgumentParser();parser.add_argument('--days',type=int,default=7);parser.add_argument('--config');args=parser.parse_args()
settings_path,settings=load_sync_config(args.config)
ROOT=Path(settings['runtimeDir']);CONFIG=Path(settings['wechatConfig']);CLI=Path(settings['wechatCli']);GROUPS=settings['groups']
now=datetime.now(timezone(timedelta(hours=8)));start=(now-timedelta(days=args.days)).strftime('%Y-%m-%d')
target=ROOT/'inbox'/now.strftime('%Y%m%d-%H%M%S');target.mkdir(parents=True,exist_ok=False)
for slug,chat in GROUPS.items():
 result=subprocess.run([str(CLI),'--config',str(CONFIG),'history',chat,'--start-time',start,'--limit','100000','--format','json'],capture_output=True,text=True,encoding='utf-8',env={**os.environ,'PYTHONIOENCODING':'utf-8'})
 if result.returncode:raise RuntimeError(f'{slug} 采集失败：{result.stderr[:400]}')
 data=json.loads(result.stdout)
 if data.get('failures') or data.get('username')!=chat or data.get('count',0)>=100000:raise RuntimeError(f'{slug} 结果缺失或不完整，禁止覆盖云端数据')
 (target/f'{slug}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'{slug}: {data["count"]} 条消息')
details=subprocess.run([settings['wechatPython'],str(Path(__file__).with_name('capture-details.py')),'--settings',str(settings_path),'--config',str(CONFIG),'--start',start,'--output',str(target)],capture_output=True,text=True,encoding='utf-8',env={**os.environ,'PYTHONIOENCODING':'utf-8'})
if details.returncode:raise RuntimeError('接龙/转账详情采集失败，禁止上传：'+details.stderr[:500])
print(details.stdout.strip())
(target/'manifest.json').write_text(json.dumps({'capturedAt':now.isoformat(),'start':start,'account':settings['account'],'groups':GROUPS},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'采集目录：{target}')
