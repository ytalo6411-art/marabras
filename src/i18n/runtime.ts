import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { patterns } from './patterns';
export const locales = [{code:'pt-BR',label:'Português'},{code:'en',label:'English'},{code:'es',label:'Español'},{code:'fr',label:'Français'}] as const;
export type Locale = typeof locales[number]['code'];
export const LOCALE_KEY='athletix:locale';
export function isLocale(value:unknown):value is Locale{return locales.some(l=>l.code===value);}
export function readLocale():Locale {try{const v=localStorage.getItem(LOCALE_KEY);return isLocale(v)?v:'pt-BR';}catch{return 'pt-BR';}}
// A shared registry keeps the provider and JSX translator in sync even if a
// development bundler loads two copies of this module. Storage is not read on
// every translation, and blocked storage still supports session-only changes.
const registry=Symbol.for('athletix.locale');
const state=globalThis as typeof globalThis & {[registry]?:Locale};
state[registry]??=readLocale();
const dictionaries:Record<Locale,Record<string,string>>={'pt-BR':{},en,es,fr};
export function getLocale(){return state[registry]!;}
export function writeLocale(locale:Locale){state[registry]=locale;try{localStorage.setItem(LOCALE_KEY,locale);}catch{/* Keep the in-memory choice. */}}
export function translate(text:string,locale=getLocale()):string {
 if(locale==='pt-BR')return text;
 const leading=text.match(/^\s*/)?.[0]??'';const trailing=text.match(/\s*$/)?.[0]??'';const key=text.trim();
 const dict=dictionaries[locale];
 if(dict[key])return leading+dict[key]+trailing;
 for(const [regex,values] of patterns){const match=key.match(regex);const template=values[locale];if(match&&template)return leading+template.replace(/\$(\d)/g,(_,n:string)=>match[Number(n)]??'')+trailing;}
 return text;
}
export function hasTranslation(text:string,locale=getLocale()){return locale==='pt-BR' || !!dictionaries[locale][text.trim()] || patterns.some(([re])=>re.test(text.trim()));}
export const t=translate;
export const LOCALES=locales.map(l=>({...l,short:l.code==='pt-BR'?'PT':l.code.toUpperCase()}));
