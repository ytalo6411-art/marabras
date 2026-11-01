import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
const strings=new Map();
function walk(n,file){if(ts.isJsxText(n)){const s=n.text.replace(/\s+/g,' ').trim();if(/[A-Za-zÀ-ÿ]/.test(s))add(s,file);}
if(ts.isStringLiteral(n)){const p=n.parent;const name=p&&ts.isJsxAttribute(p)?p.name.getText():'';if(['placeholder','title','aria-label','label','alt','text','message','description'].includes(name))add(n.text,file);
if(ts.isCallExpression(p)&&ts.isPropertyAccessExpression(p.expression)&&p.expression.name.text==='show'&&p.arguments[0]===n)add(n.text,file);
}ts.forEachChild(n,c=>walk(c,file));}
function add(s,file){if(!strings.has(s))strings.set(s,new Set());strings.get(s).add(file);}
function scan(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(!['__tests__','i18n'].includes(e.name))scan(p);}else if(/\.tsx?$/.test(e.name)){const sf=ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.Latest,true,p.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);walk(sf,p);}}}
scan('src');fs.writeFileSync('/tmp/ui-strings.json',JSON.stringify([...strings.keys()],null,2));console.log(strings.size);
