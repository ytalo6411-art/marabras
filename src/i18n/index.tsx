import { useEffect, useState, type ReactNode } from 'react';
import { LocaleContext } from './context';
import { readLocale, writeLocale, type Locale } from './runtime';
export function I18nProvider({children}:{children:ReactNode}){
 const [locale,set]=useState<Locale>(readLocale);
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 const setLocale=(value:Locale)=>{writeLocale(value);set(value);};
 return <LocaleContext.Provider value={{locale,setLocale}}><div className="locale-root">{children}</div></LocaleContext.Provider>;
}
