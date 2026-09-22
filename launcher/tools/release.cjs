'use strict';
// Uso: node tools/release.cjs 3.0.1 2 [carpeta-cliente] [carpeta-publicacion]
const fs=require('node:fs/promises'),path=require('node:path');const {hash,writeJson,json}=require('../src/io.cjs');const {validate}=require('../src/updater.cjs');
const {supportsTextHash,normalizedConfigHash}=require('../src/content.cjs');
async function build(version,revision,input,output){if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(version)||!Number.isSafeInteger(revision)||revision<1)throw Error('Indica una versión y una revisión numérica positiva.');
 const previous=await json(path.join(output,'manifest.json'),null);if(previous&&revision<=previous.revision)throw Error('La revisión debe ser mayor que la ya publicada.');
 const files=[];async function walk(dir,rel=''){for(const e of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const r=rel?rel+'/'+e.name:e.name,p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('No se permiten enlaces: '+r);if(e.isDirectory())await walk(p,r);else if(e.isFile()){if(/\.bak$|\.log$|\.tmp$|(^|\/)\.DS_Store$/.test(r))continue;if(!/^(mods|config|kubejs|resourcepacks|shaderpacks)\//.test(r))throw Error('Archivo ajeno al modpack: '+r);files.push({path:r,size:(await fs.stat(p)).size,sha256:await hash(p),policy:'managed'});}}}
 await walk(input);if(!files.some(f=>f.path.startsWith('mods/')))throw Error('La carpeta no contiene mods.');
 for(const f of files)if(supportsTextHash(f.path))f.textSha256=normalizedConfigHash(await fs.readFile(path.join(input,f.path)));
 const notes=await json(path.join(__dirname,'../pack/review.json'),{warnings:[]});const m=validate({schema:1,id:'pepaworld-3',version,revision,minecraft:'1.21.1',neoforge:'21.1.250',server:'45.43.163.21:25570',createdAt:new Date().toISOString(),warnings:notes.warnings,files});
 await fs.mkdir(path.join(output,'objects'),{recursive:true});for(const f of files){const dest=path.join(output,'objects',f.sha256);try{await fs.copyFile(path.join(input,f.path),dest,require('node:fs').constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;if(await hash(dest)!==f.sha256)throw Error('Objeto publicado dañado: '+f.sha256);}}
 // Los objetos se publican antes que el manifest, que se cambia de forma atómica.
 await writeJson(path.join(output,'manifest.json'),m);return m;
}
if(require.main===module){const [version,rev,input='pack/client',output='release']=process.argv.slice(2);build(version,Number(rev),path.resolve(input),path.resolve(output)).then(m=>console.log(`${m.version}: ${m.files.length} archivos; revisión ${m.revision}.`)).catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={build};
