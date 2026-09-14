"""通过同一账号的 wechat-cli 解密缓存读取接龙和转账卡片结构；只写本地。"""
import argparse,json,sqlite3
from pathlib import Path
from datetime import datetime
import xml.etree.ElementTree as ET
from wechat_cli.core.context import AppContext
from wechat_cli.core.contacts import get_contact_names
from wechat_cli.core.messages import resolve_chat_context,_iter_table_contexts,_query_messages,_load_name2id_maps,decompress_content,parse_time_range
from sync_config import load_sync_config
p=argparse.ArgumentParser();p.add_argument("--settings");p.add_argument('--config');p.add_argument('--start');p.add_argument('--output');args=p.parse_args()
app=AppContext(args.config);names=get_contact_names(app.cache,app.decrypted_dir);start,_=parse_time_range(args.start,'')
_,settings=load_sync_config(args.settings)
if Path(args.config).resolve()!=Path(settings['wechatConfig']).resolve():raise RuntimeError('账号配置路径不匹配')
groups=settings['groups']
for slug,chat in groups.items():
 ctx=resolve_chat_context(chat,app.msg_db_keys,app.cache,app.decrypted_dir);items=[]
 if not ctx or not ctx.get('db_path'):raise RuntimeError('群消息库不可用')
 for table in _iter_table_contexts(ctx):
  with sqlite3.connect(table['db_path']) as conn:
   mapping=_load_name2id_maps(conn);offset=0
   while True:
    rows=_query_messages(conn,table['table_name'],start_ts=start,limit=1000,offset=offset)
    if not rows:break
    offset+=len(rows)
    for row in rows:
     local_id,kind,ts,sender,content,ct=row;text=decompress_content(content,ct)
     if not text or ('#接龙' not in text and '<wcpayinfo>' not in text):continue
     pos=text.find('<msg')
     if pos<0:continue
     try:xml=ET.fromstring(text[pos:]);card=xml.find('appmsg')
     except ET.ParseError:continue
     if card is None:continue
     uid=mapping.get(sender,'');pay=card.find('wcpayinfo')
     items.append({'localId':local_id,'timestamp':datetime.fromtimestamp(ts).isoformat(),'senderId':uid,'sender':app.display_name_fn(uid,names),'title':card.findtext('title'),'type':card.findtext('type'),'payment':{e.tag:e.text for e in pay if e.tag in ['paysubtype','feedesc','transferid','transcationid','pay_memo','receiver_username','payer_username','exclusive_recv_username']} if pay is not None else None})
 items.sort(key=lambda r:(r['timestamp'],r['localId']))
 (Path(args.output)/(slug+'-cards.json')).write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
 print(slug,len(items),'张接龙/转账卡片')
