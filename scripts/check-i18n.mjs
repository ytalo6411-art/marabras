import fs from 'node:fs';
import ts from 'typescript';
const strings=JSON.parse(fs.readFileSync('/tmp/ui-strings.json','utf8'));
const source=fs.readFileSync('src/i18n/locales/en.ts','utf8');
const sf=ts.createSourceFile('en.ts',source,ts.ScriptTarget.Latest,true);
const keys=new Set();
sf.forEachChild(n=>{if(ts.isVariableStatement(n))for(const d of n.declarationList.declarations)for(const p of d.initializer.properties)keys.add(p.name.text);});
// Brands, units, email examples, code identifiers and symbols need no translation.
const invariant=new Set(['','A','ATHLETIX','Train. Track. Evolve.','Falta:','Alternativa sem CLI/token: Supabase Dashboard → SQL Editor → cole o conteúdo de','supabase/migrations/','. O arquivo é idempotente (','if not exists',') — pode rodar mais de uma vez.','min','× / semana ·','dia(s) ·','t','L meta','ml','kg','g','kcal','kcal ·','g proteína ·','100 g','de','×','× / semana','voce@email.com','0','dia(s)','×/semana','.env.example','.env','VITE_SUPABASE_URL','e','VITE_SUPABASE_ANON_KEY','••••••••']);
const missing=strings.filter(s=>!keys.has(s.trim())&&!invariant.has(s));
if(missing.length){console.error(missing);process.exit(1);}
console.log(`PASS: ${strings.length} extracted UI strings; translatable strings covered or explicitly invariant.`);
