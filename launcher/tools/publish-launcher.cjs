'use strict';
// Solo se ejecuta en GitHub Actions. El launcher nunca recibe credenciales.
const fs=require('node:fs/promises'),path=require('node:path');const {createReadStream}=require('node:fs');
const {hash,writeJson}=require('../src/io.cjs');const su=require('../src/self-update.cjs');
async function main(){
 if(process.env.GITHUB_REPOSITORY!==su.REPO||!process.env.GH_TOKEN)throw Error('Publicación disponible solo en el repositorio oficial.');
 const token=process.env.GH_TOKEN,base='https://api.github.com/repos/'+su.REPO;
 async function api(url,method='GET',body,optional=false){const res=await fetch(url.startsWith('https://')?url:base+url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});if(optional&&res.status===404)return null;if(!res.ok)throw Error('GitHub: HTTP '+res.status+' en '+method+' '+new URL(res.url).pathname);return res.status===204?null:res.json();}
 const root=path.join(__dirname,'..'),pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'))),version=pkg.version;su.versionParts(version);const tag='launcher-v'+version;
 let release=await api('/releases/tags/'+tag,'GET',null,true),manifest;
 if(release&&!release.draft){
  const asset=release.assets.find(a=>a.name==='launcher.json');if(!asset)throw Error('La versión publicada no contiene launcher.json. No se sobrescribirá.');
  const r=await fetch(asset.browser_download_url);if(!r.ok)throw Error('No se pudo recuperar el manifest publicado.');manifest=su.validate(await r.json());if(manifest.version!==version)throw Error('Versión publicada inconsistente.');
  const installer=release.assets.find(a=>a.name===su.installerName(version));if(!installer||installer.size!==manifest.assets['win32-x64'].size||installer.digest!=='sha256:'+manifest.assets['win32-x64'].sha256)throw Error('El instalador publicado no coincide con su manifest.');
 }else{
  const name=su.installerName(version),file=path.join(root,'dist',name);manifest=su.validate({schema:1,id:'pepaworld-launcher',version,assets:{'win32-x64':{url:`https://github.com/${su.REPO}/releases/download/${tag}/${name}`,size:(await fs.stat(file)).size,sha256:await hash(file)}}});
  if(!release)release=await api('/releases','POST',{tag_name:tag,target_commitish:process.env.GITHUB_SHA,name:'PepaWorld Launcher '+version,body:'Instalador Windows x64 de PepaWorld. Incluye actualización remota del launcher y conserva los ajustes y la instancia del juego. Completa el asistente de instalación. El instalador no tiene firma digital.',draft:true,prerelease:false});
  const descriptor=path.join(root,'dist/launcher.json');await writeJson(descriptor,manifest);
  for(const assetName of [name,'launcher.json']){
   const existing=release.assets.find(a=>a.name===assetName);if(existing)await api('/releases/assets/'+existing.id,'DELETE');
   const assetPath=path.join(root,'dist',assetName),size=(await fs.stat(assetPath)).size;
   const uploadUrl=release.upload_url.split('{')[0]+'?name='+encodeURIComponent(assetName);if(new URL(uploadUrl).hostname!=='uploads.github.com')throw Error('Destino de publicación inesperado.');
   const response=await fetch(uploadUrl,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/octet-stream','Content-Length':String(size)},body:createReadStream(assetPath),duplex:'half'});
   if(!response.ok)throw Error('Subida fallida: '+response.status);const uploaded=await response.json();if(uploaded.size!==size||uploaded.digest!=='sha256:'+await hash(assetPath))throw Error('La subida no coincide con el archivo local.');
  }
  await api('/releases/'+release.id,'PATCH',{draft:false,make_latest:'true'});
 }
 const current=await api('/contents/launcher.json?ref=main','GET',null,true);
 if(current){const prev=JSON.parse(Buffer.from(current.content,'base64'));if(su.compareVersions(prev.version,version)>0)throw Error('El canal ya tiene una versión más nueva.');if(prev.version===version){if(JSON.stringify(prev)!==JSON.stringify(manifest))throw Error('No se puede cambiar una versión ya publicada.');console.log('Canal ya actualizado.');return;}}
 await api('/contents/launcher.json','PUT',{message:'Publish launcher '+version+' update channel',branch:'main',content:Buffer.from(JSON.stringify(manifest,null,2)+'\n').toString('base64'),...(current?{sha:current.sha}:{})});
 console.log('Launcher '+version+' publicado y canal activado.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
