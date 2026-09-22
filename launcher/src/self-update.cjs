'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const {spawn}=require('node:child_process');
const {remoteJson,download,hash,safeTarget}=require('./io.cjs');
const REPO='PuertoT/PepaWorld-Updates';
const MANIFEST_URL=`https://raw.githubusercontent.com/${REPO}/main/launcher.json`;
function versionParts(v){if(typeof v!=='string'||!/^(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/.test(v))throw Error('Versión del launcher inválida.');return v.split('.').map(Number);}
function compareVersions(a,b){const x=versionParts(a),y=versionParts(b);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;return 0;}
function installerName(version){versionParts(version);return `PepaWorld-${version}-win-x64.exe`;}
function validate(m){
 if(!m||m.schema!==1||m.id!=='pepaworld-launcher')throw Error('Canal de launcher incompatible.');versionParts(m.version);
 const a=m.assets?.['win32-x64'];
 if(!a||!Number.isSafeInteger(a.size)||a.size<1||a.size>1024**3||typeof a.sha256!=='string'||!/^[a-f0-9]{64}$/.test(a.sha256))throw Error('Instalador del launcher inválido.');
 const expected=`https://github.com/${REPO}/releases/download/launcher-v${m.version}/${installerName(m.version)}`;
 if(a.url!==expected)throw Error('El instalador debe proceder de la versión oficial en GitHub.');
 return m;
}
async function check(currentVersion,platform=process.platform,arch=process.arch,read=remoteJson){
 versionParts(currentVersion);
 if(platform!=='win32'||arch!=='x64')return {supported:false,available:false};
 const manifest=validate(await read(MANIFEST_URL));
 return {supported:true,available:compareVersions(manifest.version,currentVersion)>0,version:manifest.version,manifest};
}
async function prepare({home,currentVersion,manifest,log=()=>{},platform=process.platform,arch=process.arch}){
 validate(manifest);if(platform!=='win32'||arch!=='x64')throw Error('La actualización del launcher está disponible para Windows x64.');
 if(compareVersions(manifest.version,currentVersion)<=0)throw Error('No hay una versión más reciente del launcher.');
 const a=manifest.assets['win32-x64'];const file=await safeTarget(path.join(home,'launcher-updates'),manifest.version+'/'+installerName(manifest.version));
 log('Descargando launcher '+manifest.version+'…');await download(a.url,file,a.sha256,a.size,log);await verify(file,a);
 return {file,asset:a,version:manifest.version};
}
async function verify(file,asset){if((await fs.stat(file)).size!==asset.size||await hash(file)!==asset.sha256)throw Error('El instalador descargado no supera la comprobación de integridad.');}
async function launch(prepared,start=spawn){
 await verify(prepared.file,prepared.asset);
 await new Promise((resolve,reject)=>{const child=start(prepared.file,[],{shell:false,detached:true,stdio:'ignore',windowsHide:true});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});});
}
module.exports={REPO,MANIFEST_URL,versionParts,compareVersions,installerName,validate,check,prepare,launch};
