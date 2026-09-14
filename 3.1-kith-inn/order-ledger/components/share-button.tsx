'use client';
import {useEffect,useRef,useState} from 'react';
import {Share2,X,Download} from 'lucide-react';
import type {LedgerData} from '../app/types';

export function ShareButton({group,date,data,disabled}:{group:string;date:string;data:LedgerData;disabled:boolean}){
  const [image,setImage]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const file=useRef<File|null>(null),dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(image)dialog.current?.showModal();return()=>{if(image)URL.revokeObjectURL(image)}},[image]);
  async function generate(){
    setBusy(true);setError('');
    try{
      const key=localStorage.getItem(`duizhang:token:${group}`);if(!key)throw Error('请用本群的完整专属链接重新打开一次，再生成分享图。');
      await document.fonts.ready;
      const {drawShareCard,shareUrl}=await import('../lib/share-card');
      const canvas=drawShareCard(document.createElement('canvas'),data,date,shareUrl(group,date,key));
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('图片生成失败，请重试')),'image/png'));
      file.current=new File([blob],`${group}-${date}-对账.png`,{type:'image/png'});setImage(URL.createObjectURL(blob));
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  async function send(){try{if(file.current&&navigator.canShare?.({files:[file.current]}))await navigator.share({files:[file.current],title:`${data.group} ${date}`});else download()}catch(e){if((e as Error).name!=='AbortError')setError('当前浏览器暂不支持发送，请保存图片后分享。')}}
  function download(){const a=document.createElement('a');a.href=image;a.download=file.current?.name??'对账.png';a.click()}
  return <><button className="share-button" onClick={generate} disabled={disabled||busy} aria-label="生成对账分享图片"><Share2 size={17}/>{busy?'生成中…':'分享'}</button>
    {error&&<div className="share-error" role="alert">{error}</div>}
    <dialog ref={dialog} className="share-dialog" onClose={()=>setImage('')}>
      <div className="share-dialog-header"><strong>分享当天对账</strong><button aria-label="关闭分享预览" onClick={()=>dialog.current?.close()}><X size={22}/></button></div>
      <p className="subtitle">长按保存图片，二维码包含本群专属访问凭证。</p>
      {image&&<img className="share-preview" src={image} alt={`${data.group} ${date} 订单与付款分享图`}/>}
      <div className="share-actions"><button onClick={download}><Download size={17}/>保存图片</button><button onClick={send}><Share2 size={17}/>发送图片</button></div>
    </dialog></>;
}
