'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'../dist/win-unpacked');const lines=[];
function esc(s){return s.replaceAll('$','$$').replaceAll('"','$\\"').replaceAll('/','\\');}
function walk(dir,rel=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const r=rel?rel+'/'+entry.name:entry.name,p=path.join(dir,entry.name);if(entry.isDirectory()){walk(p,r);lines.push(`RMDir "$INSTDIR\\${esc(r)}"`);}else lines.push(`Delete "$INSTDIR\\${esc(r)}"`);}}
walk(root);fs.writeFileSync(path.join(__dirname,'../installer/uninstall-files.nsh'),lines.join('\n')+'\n');
