import { jsxDEV as original } from 'react/jsx-dev-runtime';
import { t } from './runtime';
export { Fragment } from 'react/jsx-runtime';
type Args=Parameters<typeof original>;
const textProps=new Set(['label','title','placeholder','aria-label','alt','text','description','message','confirmLabel','cancelLabel','hint']);
export function jsxDEV(type:Args[0],props:Args[1],key:Args[2],isStaticChildren:Args[3],source:Args[4],self:Args[5]){
 const next={...(props as Record<string,unknown>)};
 if(typeof next.children==='string')next.children=t(next.children);if(Array.isArray(next.children))next.children=next.children.map(c=>typeof c==='string'?t(c):c);
 for(const prop of textProps)if(typeof next[prop]==='string')next[prop]=t(next[prop]);
 return original(type,next as Args[1],key,isStaticChildren,source,self);
}
