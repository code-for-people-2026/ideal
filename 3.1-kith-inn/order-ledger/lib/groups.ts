export const groupLinks=[{slug:'taozi',name:'桃子的健康早中晚餐'},{slug:'jingjing',name:'静静甜品屋手工美食群'},{slug:'yuma',name:'鱼妈纯手工美食（悦时光C606）'}];
export function getGroup(value:string|null){return groupLinks.find(g=>g.slug===value)}
