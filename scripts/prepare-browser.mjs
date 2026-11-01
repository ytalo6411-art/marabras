import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
const dir='/tmp/browser-libs';
if(!existsSync(dir+'/lib/libnss3.so')) {
 mkdirSync(dir,{recursive:true});
 writeFileSync('/tmp/athletix-browser-libs.tar',brotliDecompressSync(readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')));
 execFileSync('tar',['-xf','/tmp/athletix-browser-libs.tar','-C',dir]);
}
