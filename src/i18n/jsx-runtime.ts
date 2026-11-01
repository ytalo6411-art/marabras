import { jsx as originalJsx, jsxs as originalJsxs, Fragment } from 'react/jsx-runtime';
import { translate } from './runtime';
export { Fragment };
export type { JSX } from 'react';
type Args=Parameters<typeof originalJsx>;
const textProps=new Set(['placeholder','title','aria-label','alt','label','text','message','description','confirmLabel','cancelLabel','hint']);
function prepare(props:Args[1]){const next:Record<string,unknown>={...(props as Record<string,unknown>)};for(const key of textProps)if(typeof next[key]==='string')next[key]=translate(next[key]);if(typeof next.children==='string')next.children=translate(next.children);if(Array.isArray(next.children))next.children=next.children.map((c:unknown)=>typeof c==='string'?translate(c):c);return next as Args[1];}
// Translate at the JSX boundary, never through DOM mutation. Values and URLs stay untouched.
export function jsx(type:Args[0],props:Args[1],key?:Args[2]){return originalJsx(type,prepare(props),key);}
export function jsxs(type:Args[0],props:Args[1],key?:Args[2]){return originalJsxs(type,prepare(props),key);}
