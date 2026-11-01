import { LOCALES, isLocale } from '@/i18n/runtime';
import { useI18n } from '@/i18n/context';
export default function LanguageSelector() {
  const {locale,setLocale}=useI18n();
  return <select className="language-select" title="Idioma" aria-label="Idioma" value={locale} onChange={e=>{if(isLocale(e.target.value))setLocale(e.target.value);}}>{LOCALES.map(l=><option key={l.code} value={l.code} lang={l.code} aria-label={l.label}>{l.short}</option>)}</select>;
}
