'use strict';
// En GitHub, reconstruye el paquete desde los objetos del repositorio.
const fs=require('node:fs/promises'),path=require('node:path');
const {json,writeJson,hash,safeTarget}=require('../src/io.cjs');const {validate}=require('../src/updater.cjs');
(async()=>{const repo=path.resolve(process.argv[2]||'..'),root=path.join(__dirname,'..');const m=validate(await json(path.join(repo,'version.json')));
 for(const f of m.files){const object=await safeTarget(repo,'objects/'+f.sha256);if(await hash(object)!==f.sha256||(await fs.stat(object)).size!==f.size)throw Error('Objeto incorrecto: '+f.path);const out=await safeTarget(path.join(root,'pack/client'),f.path);await fs.mkdir(path.dirname(out),{recursive:true});await fs.copyFile(object,out);}
 await writeJson(path.join(root,'release/manifest.json'),m);console.log('Paquete restaurado: '+m.files.length+' archivos, revisión '+m.revision);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
