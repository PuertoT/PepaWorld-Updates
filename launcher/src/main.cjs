'use strict';
const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');
const {exists,json,writeJson,remoteJson,secureUrl}=require('./io.cjs');const updater=require('./updater.cjs');const mc=require('./minecraft.cjs');
const {migrateUpdateChannel}=require('./settings.cjs');
const selfUpdate=require('./self-update.cjs');
let launcherUpdate={supported:process.platform==='win32'&&process.arch==='x64',available:false},launcherUpdateError='';
async function checkLauncher(){launcherUpdateError='';try{launcherUpdate=await selfUpdate.check(app.getVersion());}catch(e){launcherUpdate={supported:process.platform==='win32'&&process.arch==='x64',available:false};launcherUpdateError='No se pudo comprobar el launcher. Puedes seguir usando la versión instalada.';}}
let win,busy=false,settings,config,home,bundled,latest,source='incluido',lastError='';
const root=path.join(__dirname,'..');
function log(message){const clean=String(message).slice(-3000);win?.webContents.send('progress',clean);}
async function saveSettings(){await writeJson(path.join(home,'settings.json'),settings);}
async function current(){const installed=await json(path.join(home,'installed.json'),null);const ready=await json(path.join(home,'ready.json'),null);return {appVersion:app.getVersion(),launcherUpdate:{supported:launcherUpdate.supported,available:launcherUpdate.available,version:launcherUpdate.version,error:launcherUpdateError},settings,installed:installed?.version||null,available:latest?.version||null,source,ready:!!ready&&ready.minecraft===settings.minecraftDir&&await exists(path.join(settings.minecraftDir,'versions',mc.VERSION,mc.VERSION+'.json')),warnings:latest?.warnings||[],error:lastError,remoteConfigured:!!settings.manifestUrl,home};}
async function check(){lastError='';const local=await json(path.join(bundled,'manifest.json'));updater.validate(local);
 const installed=await json(path.join(home,'installed.json'),null);
 latest=local;source='incluido';
 if(settings.manifestUrl){try{latest=updater.validate(await remoteJson(settings.manifestUrl));source='remoto';await writeJson(path.join(home,'manifest-cache.json'),latest);}catch(e){lastError='No se pudo comprobar la actualización: '+e.message;const cached=await json(path.join(home,'manifest-cache.json'),null);if(cached){latest=updater.validate(cached);source='caché';}}}
 // Una versión incluida antigua nunca se presenta como actualización.
 if(installed&&latest.revision<installed.revision){latest={...local,...installed};source='instalado';}
 return current();
}
async function install(){await mc.guardProcesses();await fs.mkdir(settings.gameDir,{recursive:true});await updater.recover(home,settings.gameDir);if(!latest)await check();
 if(latest.revision===1&&latest.warnings?.length)log('Esta versión conserva avisos de la auditoría. Consulta el informe antes de distribuirla.');
 const java=await mc.ensureJava(home,config,log);await mc.installLoader(home,settings.minecraftDir,java,config,log);
 await fs.rm(path.join(home,'ready.json'),{force:true});
 await updater.update({home,game:settings.gameDir,manifest:latest,bundled,remoteUrl:settings.manifestUrl,log});
 await mc.server(settings.gameDir);await mc.profile(settings.minecraftDir,settings.gameDir,java,settings.memoryGB);
 await writeJson(path.join(home,'ready.json'),{minecraft:settings.minecraftDir,gameDir:settings.gameDir,version:latest.version});
 log('Preparado. Pulsa Jugar y elige PepaWorld 3.0 en tu launcher.');return current();
}
function handle(name,action,exclusive=false){ipcMain.handle(name,async(event,...args)=>{
 if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame)throw Error('Origen no permitido.');
 if(exclusive&&busy)throw Error('Hay una operación en curso.');if(exclusive)busy=true;
 try{return await action(...args);}catch(e){log(e.message);throw e;}finally{if(exclusive)busy=false;}
});}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.on('second-instance',()=>{win?.show();win?.focus();});
 app.whenReady().then(async()=>{
  home=app.getPath('userData');bundled=app.isPackaged?path.join(process.resourcesPath,'bundled'):path.join(root,'release');config=await json(path.join(root,'launcher.config.json'));
  settings=await json(path.join(home,'settings.json'),{minecraftDir:mc.defaultMinecraft(),gameDir:path.join(home,'instance'),manifestUrl:config.manifestUrl||'',launcherMode:'official',launcherPath:'',launcherArgs:[],memoryGB:Math.max(2,Math.min(6,Math.floor(os.totalmem()/1024**3/2)))});
  if(path.resolve(settings.gameDir)!==path.resolve(home,'instance'))throw Error('La instancia debe estar en la carpeta aislada de PepaWorld.');
  const migrated=migrateUpdateChannel(settings,config.manifestUrl);if(migrated!==settings){settings=migrated;await saveSettings();}
  await updater.recover(home,settings.gameDir);
  win=new BrowserWindow({width:1160,height:780,minWidth:920,minHeight:680,title:'PepaWorld 3.0',backgroundColor:'#101d19',icon:path.join(root,'assets/icon.png'),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.session.setPermissionRequestHandler((_w,_p,cb)=>cb(false));
  win.on('close',event=>{if(busy){event.preventDefault();log('Espera a que termine la operación antes de cerrar.');}});
  handle('state',current);handle('check',async()=>{await Promise.all([check(),checkLauncher()]);return current();},true);handle('update',async()=>{await check();return install();},true);
  handle('update-launcher',async()=>{
   if(!app.isPackaged)throw Error('Instala la aplicación para actualizar el launcher.');
   await mc.guardProcesses();await checkLauncher();if(launcherUpdateError)throw Error(launcherUpdateError);if(!launcherUpdate.available)return current();
   const prepared=await selfUpdate.prepare({home,currentVersion:app.getVersion(),manifest:launcherUpdate.manifest,log});
   const choice=await dialog.showMessageBox(win,{type:'info',title:'Actualizar PepaWorld',message:'Launcher '+prepared.version+' descargado y verificado.',detail:'Se cerrará PepaWorld y se abrirá el instalador. Completa sus pasos y vuelve a abrir PepaWorld. Tus mundos y ajustes se conservan.',buttons:['Instalar ahora','Más tarde'],defaultId:0,cancelId:1});
   if(choice.response!==0){log('Instalador guardado. Puedes instalarlo después desde Actualizar launcher.');return current();}
   await mc.guardProcesses();await selfUpdate.launch(prepared);busy=false;app.quit();
  },true);
  handle('choose',async(kind)=>{if(!['minecraft','launcher'].includes(kind))throw Error('Selección desconocida');const result=await dialog.showOpenDialog(win,{title:kind==='minecraft'?'Seleccionar carpeta de Minecraft':'Seleccionar launcher',properties:kind==='minecraft'?['openDirectory']:process.platform==='darwin'?['openFile','openDirectory']:['openFile']});return result.canceled?null:result.filePaths[0];},true);
  handle('settings',async s=>{if(!s||typeof s.minecraftDir!=='string'||!path.isAbsolute(s.minecraftDir)||!['official','external'].includes(s.launcherMode)||typeof s.launcherPath!=='string'||!Array.isArray(s.launcherArgs)||s.launcherArgs.length>40||!s.launcherArgs.every(x=>typeof x==='string'&&x.length<2000))throw Error('Ajustes no válidos.');
   const dir=path.resolve(s.minecraftDir),isolated=path.resolve(settings.gameDir);if(dir===isolated||dir.startsWith(isolated+path.sep)||isolated.startsWith(dir+path.sep))throw Error('La carpeta de Minecraft debe estar separada de la instancia de PepaWorld.');
   if(s.manifestUrl)secureUrl(s.manifestUrl);if(!Number.isInteger(s.memoryGB)||s.memoryGB<2||s.memoryGB>32)throw Error('La memoria debe estar entre 2 y 32 GB.');
   const changed=dir!==settings.minecraftDir||s.memoryGB!==settings.memoryGB;settings={...settings,minecraftDir:dir,launcherMode:s.launcherMode,launcherPath:s.launcherPath,launcherArgs:s.launcherArgs,manifestUrl:s.manifestUrl||'',memoryGB:s.memoryGB};await saveSettings();if(changed)await fs.rm(path.join(home,'ready.json'),{force:true});latest=null;return check();},true);
  handle('play',async()=>{const state=await current();if(!state.ready)throw Error('Pulsa Actualizar para preparar la instalación.');await check();const installed=await json(path.join(home,'installed.json'));if(latest.revision>installed.revision)throw Error('Hay una actualización. Pulsa Actualizar antes de jugar.');
   const status=await updater.inspect(home,settings.gameDir,{...latest,files:installed.files});if(status.changed){const details=status.changedFiles.slice(0,6).map(f=>f.path+(f.reason==='missing'?' (falta)':' (modificado)')).join(', ');throw Error('Revisa estos archivos: '+details+(status.changed>6?' y '+(status.changed-6)+' más':'')+'. Pulsa Actualizar para repararlos.');}await mc.play(settings);log(settings.launcherMode==='official'?'Minecraft Launcher abierto: entra en Java Edition, selecciona PepaWorld 3.0 y pulsa Jugar allí.':'Launcher abierto. Usa la instancia de PepaWorld 3.0.');return current();},true);
  handle('folder',async()=>{await fs.mkdir(settings.gameDir,{recursive:true});const error=await shell.openPath(settings.gameDir);if(error)throw Error(error);});
  await win.loadFile(path.join(root,'ui/index.html'));
 }).catch(e=>{dialog.showErrorBox('PepaWorld 3.0',e.message);app.quit();});
 app.on('window-all-closed',()=>app.quit());
}
