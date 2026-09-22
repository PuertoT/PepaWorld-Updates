'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');
const {exists,json,writeJson,hash,safeRelative,safeTarget,download,secureUrl}=require('./io.cjs');
const {supportsTextHash,normalizedConfigHash}=require('./content.cjs');
function validate(m){
 if(m.schema!==1||m.id!=='pepaworld-3'||m.minecraft!=='1.21.1'||m.neoforge!=='21.1.250'||!Number.isSafeInteger(m.revision)||m.revision<1||typeof m.version!=='string'||m.version.length>80||!Array.isArray(m.files)||m.files.length>10000)throw Error('Manifest incompatible o inválido.');
 const seen=new Set();let total=0;
 for(const f of m.files){safeRelative(f.path);if(!/^(mods|config|kubejs|resourcepacks|shaderpacks)\//.test(f.path))throw Error('Carpeta no administrable: '+f.path);
   if(!/^[a-f0-9]{64}$/.test(f.sha256)||!Number.isSafeInteger(f.size)||f.size<0||f.size>1024**3||!['managed','seed'].includes(f.policy))throw Error('Registro de archivo inválido.');
   if(f.textSha256!==undefined&&(!supportsTextHash(f.path)||!/^[a-f0-9]{64}$/.test(f.textSha256)))throw Error('Huella de configuración inválida.');
  const key=f.path.toLowerCase();if(seen.has(key))throw Error('Archivo duplicado en manifest.');seen.add(key);total+=f.size;
 }if(total>12*1024**3)throw Error('Modpack demasiado grande.');return m;
}
async function recover(home,game){const journal=path.join(home,'transaction.json');if(!await exists(journal))return;
 const j=await json(journal);if(j.game!==path.resolve(game))throw Error('La recuperación corresponde a otra instancia.');
 for(const op of [...j.ops].reverse()){
  const target=await safeTarget(game,op.path), backup=await safeTarget(path.join(home,'backups',j.id),op.path);
  if(await exists(backup)){await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(backup,target);}
  else if(!op.hadOriginal)await fs.rm(target,{force:true});
 }
 if(j.oldState)await writeJson(path.join(home,'installed.json'),j.oldState);else await fs.rm(path.join(home,'installed.json'),{force:true});
 await fs.rm(journal,{force:true});
}
async function matchesFile(target,f){
 if(await hash(target)===f.sha256)return true;
 return !!f.textSha256&&supportsTextHash(f.path)&&normalizedConfigHash(await fs.readFile(target))===f.textSha256;
}
async function inspect(home,game,m){validate(m);const old=await json(path.join(home,'installed.json'),null);const changedFiles=[];
 for(const f of m.files){const target=await safeTarget(game,f.path),present=await exists(target);if(f.policy==='seed'&&present)continue;if(!present)changedFiles.push({path:f.path,reason:'missing'});else if(!await matchesFile(target,f))changedFiles.push({path:f.path,reason:'modified'});}
 const paths=new Set(m.files.map(f=>f.path));const removed=(old?.files||[]).filter(f=>!paths.has(f.path)).length;
 return {installed:old?.version||null,available:m.version,changed:changedFiles.length,changedFiles,removed,revision:old?.revision||0};
}
async function update({home,game,manifest:m,bundled,remoteUrl,log=()=>{},failAfter}){
 validate(m);await fs.mkdir(home,{recursive:true});await fs.mkdir(game,{recursive:true});await recover(home,game);
 const statePath=path.join(home,'installed.json'),old=await json(statePath,null);
 if(old && old.revision>m.revision)throw Error('El paquete disponible es anterior al instalado. No se realizará una bajada automática.');
 if(old&&old.revision===m.revision&&JSON.stringify(old.files)!==JSON.stringify(m.files))throw Error('La revisión ya existe con archivos distintos. Publica una revisión nueva.');
 const changes=[],deletions=[];const id=Date.now()+'-'+crypto.randomUUID().slice(0,8);const stage=path.join(home,'staging',id);await fs.mkdir(stage,{recursive:true});
 try {
  let index=0;
  for(const f of m.files){const target=await safeTarget(game,f.path);index++;
   if(f.policy==='seed'&&await exists(target))continue;
   if(await exists(target)&&await matchesFile(target,f))continue;
   log(`Preparando ${index}/${m.files.length}: ${f.path}`);
   const out=await safeTarget(stage,f.path);await fs.mkdir(path.dirname(out),{recursive:true});
   const local=path.join(bundled,'objects',f.sha256);
   if(await exists(local)&&await hash(local)===f.sha256)await fs.copyFile(local,out);
   else {if(!remoteUrl)throw Error('Falta un archivo en el paquete incluido.');const base=secureUrl(remoteUrl);const url=new URL('objects/'+f.sha256,base);await download(url.href,out,f.sha256,f.size,log);}
   if((await fs.stat(out)).size!==f.size||await hash(out)!==f.sha256)throw Error('Archivo no válido: '+f.path);
   changes.push(f.path);
  }
  const wanted=new Set(m.files.map(f=>f.path));
  for(const f of old?.files||[]){safeRelative(f.path);if(!/^(mods|config|kubejs|resourcepacks|shaderpacks)\//.test(f.path))throw Error('Estado local inválido.');if(!wanted.has(f.path)&&f.policy!=='seed'&&await exists(await safeTarget(game,f.path)))deletions.push(f.path);}
  // Todas las descargas se verifican antes de tocar la instalación activa.
  const ops=[];for(const rel of [...changes,...deletions]){const target=await safeTarget(game,rel);const hadOriginal=await exists(target);if(hadOriginal){const backup=await safeTarget(path.join(home,'backups',id),rel);await fs.mkdir(path.dirname(backup),{recursive:true});await fs.copyFile(target,backup);}ops.push({path:rel,hadOriginal});}
  const journal=path.join(home,'transaction.json');await writeJson(journal,{id,game:path.resolve(game),ops,oldState:old});
  try {
   let n=0;for(const rel of changes){const target=await safeTarget(game,rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.rename(await safeTarget(stage,rel),target);if(++n===failAfter)throw Error('Fallo simulado');}
   for(const rel of deletions)await fs.rm(await safeTarget(game,rel),{force:true});
   await writeJson(statePath,{schema:1,version:m.version,revision:m.revision,files:m.files,installedAt:new Date().toISOString()});await fs.rm(journal,{force:true});
  }catch(e){await recover(home,game);throw e;}
  log(`Modpack ${m.version} preparado. ${changes.length} archivos actualizados.`);return {changed:changes.length,removed:deletions.length};
 }finally{await fs.rm(stage,{recursive:true,force:true});}
}
module.exports={validate,recover,inspect,update};
