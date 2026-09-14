"""阻止对账私有文件进入仓库，也检查 PR 中先上传再删除的提交。"""
import argparse
from pathlib import PurePosixPath
import subprocess


def git(*args, input=None):
    result = subprocess.run(['git', *args], input=input, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, check=True)
    return result.stdout


def guarded(path):
    return (path.startswith(b'3.1-kith-inn/order-ledger/') or
            path.startswith(b'.codex-remote-attachments/') or
            PurePosixPath(path.decode('utf-8')).name.startswith('.env'))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', help='PR 基线提交；省略时只检查暂存区')
args = parser.parse_args()
paths = set(filter(guarded, filter(None, git('ls-files', '-z').split(b'\0'))))
if args.base:
    for commit in git('rev-list', f'{args.base}..HEAD').decode().splitlines():
        paths.update(filter(guarded, filter(None, git('ls-tree', '-r', '--name-only', '-z', commit).split(b'\0'))))
if paths:
    result = subprocess.run(['git', 'check-ignore', '--no-index', '-z', '--stdin'],
                            input=b'\0'.join(sorted(paths)) + b'\0', stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if result.returncode not in (0, 1):
        raise RuntimeError('无法检查 Git 忽略规则')
    ignored = list(filter(None, result.stdout.split(b'\0')))
    if ignored:
        print('发现不应提交的私有文件（可能存在于 PR 的早期提交中）：')
        for path in ignored:
            print(path.decode('utf-8'))
        raise SystemExit(1)
print('私有文件检查通过：对账源码、配置模板与私有运行数据已分开。')
