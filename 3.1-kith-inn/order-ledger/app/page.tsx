import {groupLinks} from '../lib/groups';
export default function Page(){
  return <main className="shell"><div className="topline"><span className="mark">账</span>每日对账</div><h1>选择要核对的群</h1><p className="subtitle">订单和付款记录按群保存，选择日期即可开始对账。</p><nav aria-label="选择群" className="group-list">{groupLinks.map(group=><a className="panel group-link" href={`/${group.slug}`} key={group.slug}><strong>{group.name}</strong><span>查看每日订单与收款 →</span></a>)}</nav></main>;
}
