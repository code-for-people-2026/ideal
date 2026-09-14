import {notFound} from 'next/navigation';
import {getGroup} from '../../lib/groups';
import Ledger from '../ledger';
export default async function Page({params}:{params:Promise<{group:string}>}){
 const {group}=await params;if(!getGroup(group))notFound();return <Ledger key={group} group={group}/>;
}
