"""读取本机私有同步配置，验证账号与数据库目录一致。"""
import json, os
from pathlib import Path

def load_sync_config(path=None):
    path=Path(path or os.environ.get('ORDER_LEDGER_CONFIG') or Path(__file__).resolve().parents[1]/'sync.config.json').resolve()
    settings=json.loads(path.read_text(encoding='utf-8'))
    if set(settings['groups'])!={'taozi','jingjing','yuma'}:raise RuntimeError('必须配置三个目标群')
    config=json.loads(Path(settings['wechatConfig']).read_text(encoding='utf-8'))
    account=settings['accountDirectory']
    if config.get('expected_account')!=account or Path(config['db_dir']).parent.name!=account or not account.startswith(settings['account']+'_'):raise RuntimeError('微信账号配置不匹配')
    return path, settings
