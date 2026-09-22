'use strict';
const path=require('node:path');const {spawn}=require('node:child_process');
const {exists,run}=require('./io.cjs');
const STORE_FAMILY='Microsoft.4297127D64EC6_8wekyb3d8bbwe';
// La consulta devuelve identificadores registrados por Windows para este usuario.
// No se usa ningún protocolo de la edición Bedrock.
const STORE_QUERY=String.raw`
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$items = @()
try {
  $items = @(Get-StartApps | Where-Object {
    $_.AppID -like 'Microsoft.4297127D64EC6_8wekyb3d8bbwe!*' -or $_.Name -eq 'Minecraft Launcher'
  } | Select-Object Name, AppID)
} catch {}
if ($items.Count -eq 0) {
  foreach ($package in @(Get-AppxPackage -Name 'Microsoft.4297127D64EC6')) {
    foreach ($id in (Get-AppxPackageManifest $package).Package.Applications.Application.Id) {
      $items += [PSCustomObject]@{ Name = 'Minecraft Launcher'; AppID = $package.PackageFamilyName + '!' + $id }
    }
  }
}
ConvertTo-Json -InputObject @($items) -Compress
`;
function isBedrock(value){return /Microsoft\.MinecraftUWP|Microsoft\.MinecraftWindowsBeta|Minecraft\.Windows\.exe/i.test(String(value));}
function chooseRegisteredApps(rows){
 if(!Array.isArray(rows))rows=rows?[rows]:[];
 const valid=rows.filter(r=>r&&typeof r.AppID==='string'&&r.AppID.length<=200&&/^[a-zA-Z0-9_.!{}-]+$/.test(r.AppID)&&!isBedrock(r.AppID)&&(r.AppID.startsWith(STORE_FAMILY+'!')||r.Name==='Minecraft Launcher'));
 const unique=[...new Map(valid.map(r=>[r.AppID,r])).values()];
 const known=unique.filter(r=>r.AppID.startsWith(STORE_FAMILY+'!'));
 if(known.length===1)return known[0].AppID;
 const main=known.filter(r=>r.AppID.split('!')[1]==='Minecraft');
 if(main.length===1)return main[0].AppID;
 return unique.length===1?unique[0].AppID:null;
}
async function resolveOfficial(manual='',deps={}){
 const platform=deps.platform||process.platform,env=deps.env||process.env,fileExists=deps.exists||exists,execute=deps.run||run;
 const p=platform==='win32'?path.win32:path;
 if(manual){
  if(isBedrock(manual))throw Error('Has seleccionado Minecraft para Windows (Bedrock). Elige Minecraft Launcher para jugar a Java.');
  if(!p.isAbsolute(manual)||!await fileExists(manual))throw Error('La aplicación seleccionada no existe. Deja su campo vacío para detectarla automáticamente.');
  if(platform==='win32'&&!manual.toLowerCase().endsWith('.exe'))throw Error('Selecciona MinecraftLauncher.exe o deja el campo vacío para detectar la aplicación de Microsoft Store.');
  return {kind:platform==='darwin'&&manual.endsWith('.app')?'app':'executable',file:manual};
 }
 if(platform==='win32'){
  const dirs=[env['ProgramFiles(x86)']||'C:\\Program Files (x86)',env.ProgramFiles||'C:\\Program Files'];
  if(env.LOCALAPPDATA)dirs.push(p.join(env.LOCALAPPDATA,'Programs'));
  for(const dir of dirs){const exe=p.join(dir,'Minecraft Launcher','MinecraftLauncher.exe');if(await fileExists(exe))return {kind:'executable',file:exe};}
  try {const raw=await execute('powershell.exe',['-NoProfile','-NonInteractive','-Command',STORE_QUERY],{timeout:20000});const id=chooseRegisteredApps(JSON.parse(raw.replace(/^\uFEFF/,'').trim()||'[]'));if(id)return {kind:'store',id};}catch{/* Si falla la detección, se informa; nunca se abre otra edición. */}
 }else if(platform==='darwin'&&await fileExists('/Applications/Minecraft.app'))return {kind:'app',file:'/Applications/Minecraft.app'};
 throw Error('No encuentro Minecraft Launcher para Java. Ábrelo desde Inicio o selecciona MinecraftLauncher.exe en Ajustes. No se ha abierto Minecraft para Windows.');
}
function start(exe,args){return new Promise((resolve,reject)=>{const child=spawn(exe,args,{detached:true,stdio:'ignore',shell:false});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});});}
async function launchOfficial(manual='',deps={}){
 const target=await resolveOfficial(manual,deps),launch=deps.start||start,env=deps.env||process.env;
 if(target.kind==='store'){
  const explorer=path.win32.join(env.SystemRoot||'C:\\Windows','explorer.exe');
  await launch(explorer,['shell:AppsFolder\\'+target.id]);return 'Minecraft Launcher de Microsoft Store';
 }
 if(target.kind==='app')await launch('open',['-a',target.file]);else await launch(target.file,[]);
 return 'Minecraft Launcher';
}
module.exports={chooseRegisteredApps,resolveOfficial,launchOfficial,start,STORE_QUERY};
