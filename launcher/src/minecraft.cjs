'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');const {resolveOfficial,launchOfficial,start}=require('./launcher.cjs');
const {exists,json,writeJson,atomic,hash,download,remoteJson,run,safeTarget}=require('./io.cjs');const {addServer}=require('./nbt.cjs');
const VERSION='neoforge-21.1.250',PROFILE='pepaworld-3';
function defaultMinecraft(){return process.platform==='win32'?path.join(process.env.APPDATA||os.homedir(),'.minecraft'):process.platform==='darwin'?path.join(os.homedir(),'Library','Application Support','minecraft'):path.join(os.homedir(),'.minecraft');}
async function guardProcesses(){
 const cmd=process.platform==='win32'?await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$p=Get-CimInstance Win32_Process; $busy=$p | Where-Object { $_.Name -match '^(MinecraftLauncher|Minecraft|javaw?|prismlauncher|multimc)(.exe)?$' }; if ($busy) { 'BUSY' }"],{timeout:15000}):await run('ps',['-axo','comm='],{timeout:15000});
 if(process.platform==='win32'?cmd.includes('BUSY'):cmd.split('\n').some(s=>/(^|\/)(java|javaw|Minecraft|Minecraft Launcher|prismlauncher|multimc)\s*$/i.test(s.trim())))throw Error('Cierra Minecraft y su launcher antes de instalar o actualizar. Cierra también otras aplicaciones Java durante la preparación.');
}
async function javaVersion(exe){try{return /version "21[.\"]/.test(await run(exe,['-version'],{timeout:15000}));}catch{return false;}}
async function findJava(root){if(!await exists(root))return null;const todo=[root];while(todo.length){const d=todo.shift();for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())todo.push(p);else if(e.name===(process.platform==='win32'?'java.exe':'java')&&path.basename(d)==='bin'&&await javaVersion(p))return p;}}return null;}
async function ensureJava(home,config,log){const runtime=path.join(home,'runtime');const cached=await findJava(runtime);if(cached)return cached;
 const candidates=[process.env.JAVA_HOME&&path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java'),'java'].filter(Boolean);
 for(const p of candidates)if(await javaVersion(p)){if(p!=='java')return p;for(const dir of (process.env.PATH||'').split(path.delimiter)){const full=path.join(dir,process.platform==='win32'?'java.exe':'java');if(await exists(full)&&await javaVersion(full))return full;}}
 const key=process.platform+'-'+process.arch,asset=config.java[key];if(!asset)throw Error('No hay Java 21 automático para esta arquitectura: '+key);
 log('Descargando Java 21 para PepaWorld…');const archive=path.join(home,'downloads',asset.archive);await download(asset.url,archive,asset.sha256,asset.size,log);
 const temp=path.join(home,'runtime-new');await fs.rm(temp,{recursive:true,force:true});await fs.mkdir(temp,{recursive:true});
 if(process.platform==='win32')await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',"Expand-Archive -LiteralPath $env:PEPA_ARCHIVE -DestinationPath $env:PEPA_EXTRACT -Force"],{env:{...process.env,PEPA_ARCHIVE:archive,PEPA_EXTRACT:temp}});
 else await run('tar',['-xzf',archive,'-C',temp]);
 const found=await findJava(temp);if(!found)throw Error('Java 21 descargado no funciona.');await fs.rm(runtime,{recursive:true,force:true});await fs.rename(temp,runtime);return findJava(runtime);
}
async function installLoader(home,mc,java,config,log){
 const target=path.join(mc,'versions',VERSION,VERSION+'.json');const marker=path.join(home,'loader.json');
 const previous=await json(marker,null);if(previous?.minecraft===mc&&await exists(target))return;
 const work=path.join(home,'neoforge-install');await fs.mkdir(work,{recursive:true});await writeJson(path.join(work,'launcher_profiles.json'),{profiles:{},version:3});
 log('Preparando Minecraft 1.21.1…');const versions=await remoteJson('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json');const release=versions.versions.find(v=>v.id==='1.21.1');if(!release)throw Error('Minecraft 1.21.1 no aparece en el catálogo oficial.');
 const metaPath=path.join(work,'versions','1.21.1','1.21.1.json');await download(release.url,metaPath,release.sha1,undefined,log,'sha1');const meta=await json(metaPath);const client=meta.downloads.client;
 await download(client.url,path.join(work,'versions','1.21.1','1.21.1.jar'),client.sha1,client.size,log,'sha1');
 const installer=path.join(home,'downloads','neoforge-21.1.250-installer.jar');await download(config.installer.url,installer,config.installer.sha256,config.installer.size,log);
 log('Instalando NeoForge 21.1.250. Puede tardar varios minutos…');
 const logPath=path.join(home,'neoforge-install.log');await fs.writeFile(logPath,'');
 const fh=await fs.open(logPath,'a');try{await run(java,['-Djava.awt.headless=true','-jar',installer,'--installClient',work],{cwd:work,log:s=>fh.write(s).catch(()=>{}),timeout:30*60*1000});}finally{await fh.close();}
 const generated=path.join(work,'versions',VERSION,VERSION+'.json');if(!await exists(generated))throw Error('NeoForge no ha generado la versión esperada. Revisa neoforge-install.log.');
 // Copia aditiva de artefactos compartidos: nunca reemplaza un archivo diferente.
 async function merge(from,to){await fs.mkdir(to,{recursive:true});for(const e of await fs.readdir(from,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Enlace inesperado en NeoForge.');const a=path.join(from,e.name),b=path.join(to,e.name);if(e.isDirectory())await merge(a,b);else if(await exists(b)){if(await hash(a)!==await hash(b))throw Error('Ya existe un archivo diferente en '+b+'. No se ha reemplazado.');}else await fs.copyFile(a,b);}}
 for(const folder of ['libraries','versions'])if(await exists(path.join(work,folder)))await merge(path.join(work,folder),path.join(mc,folder));
 await writeJson(marker,{minecraft:mc,version:VERSION});
}
async function gameJava(java,platform=process.platform,fileExists=exists){
 if(platform!=='win32'||path.win32.basename(java).toLowerCase()!=='java.exe')return java;
 const gui=path.win32.join(path.win32.dirname(java),'javaw.exe');
 return await fileExists(gui)?gui:java;
}
async function profile(mc,game,java,memory){
 const gameRuntime=await gameJava(java);
 await fs.mkdir(mc,{recursive:true});const candidates=['launcher_profiles.json','launcher_profiles_microsoft_store.json'];let found=false;
 for(const name of candidates){const p=path.join(mc,name);if(!await exists(p)&&name!=='launcher_profiles.json')continue;
  const raw=await exists(p)?await fs.readFile(p):null;const data=raw?JSON.parse(raw.toString()):{profiles:{},version:3};
  if(!data.profiles||typeof data.profiles!=='object')throw Error('Archivo de perfiles no válido.');
  if(raw)await fs.copyFile(p,p+'.pepaworld-backup');
  data.profiles[PROFILE]={...data.profiles[PROFILE],name:'PepaWorld 3.0',type:'custom',lastVersionId:VERSION,gameDir:game,javaDir:gameRuntime,javaArgs:`-Xmx${memory}G -Xms1G`,icon:'Grass',created:data.profiles[PROFILE]?.created||new Date().toISOString(),lastUsed:new Date().toISOString()};
  // No modifica cuentas, tokens, selectedUser ni perfiles ajenos.
  await writeJson(p,data);found=true;
 }return found;
}
async function server(game){const p=await safeTarget(game,'servers.dat');const raw=await exists(p)?await fs.readFile(p):null;const next=addServer(raw);if(raw&&!raw.equals(next))await fs.copyFile(p,p+'.pepaworld-backup');await atomic(p,next);}
async function detectLauncher(){return resolveOfficial();}
async function play(settings){
 if(settings.launcherMode==='external'){
  if(!settings.launcherPath)throw Error('Selecciona el ejecutable de tu launcher en Ajustes.');
  const args=settings.launcherArgs.map(s=>s.replaceAll('{gameDir}',settings.gameDir).replaceAll('{minecraftDir}',settings.minecraftDir).replaceAll('{version}',VERSION));
  if(process.platform==='darwin'&&settings.launcherPath.endsWith('.app'))return start('open',['-a',settings.launcherPath,'--args',...args]);return start(settings.launcherPath,args);
 }
 return launchOfficial(settings.launcherPath||'');
}
module.exports={defaultMinecraft,guardProcesses,ensureJava,installLoader,gameJava,profile,server,play,detectLauncher,VERSION};
