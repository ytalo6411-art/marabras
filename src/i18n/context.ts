import { createContext, useContext } from 'react';
import type { Locale } from './runtime';
export const LocaleContext=createContext<{locale:Locale;setLocale:(l:Locale)=>void}>({locale:'pt-BR',setLocale:()=>{}});
export function useLocaleContext(){return useContext(LocaleContext);}
import { translate } from './runtime';
export function useI18n(){const {locale,setLocale}=useLocaleContext();return {locale,t:translate,setLocale};}
