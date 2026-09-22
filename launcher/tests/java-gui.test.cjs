'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {gameJava,profile}=require('../src/minecraft.cjs');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
test('Windows usa javaw del mismo JDK para el juego, con espacios en la ruta',async()=>{
 const java='C:\\Program Files\\Eclipse Adoptium\\jdk-21\\bin\\java.exe';
 const gui='C:\\Program Files\\Eclipse Adoptium\\jdk-21\\bin\\javaw.exe';
 assert.equal(await gameJava(java,'win32',async p=>p===gui),gui);
 assert.equal(await gameJava(java,'win32',async()=>false),java);
 assert.equal(await gameJava(gui,'win32',async()=>{throw Error('No debe buscar');}),gui);
 assert.equal(await gameJava('/opt/java/bin/java','linux',async()=>{throw Error('No debe buscar');}),'/opt/java/bin/java');
});
test('El perfil Windows persiste javaw y conserva los perfiles y ajustes ajenos',async t=>{
 if(process.platform!=='win32')return t.skip('Integración de rutas Windows');
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'pepa-java-gui-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const bin=path.join(root,'JDK con espacios','bin');await fs.mkdir(bin,{recursive:true});await fs.writeFile(path.join(bin,'javaw.exe'),'fixture');
 const mc=path.join(root,'minecraft');await fs.mkdir(mc);const initial={profiles:{otro:{name:'Conservar'}},selectedProfile:'otro',settings:{keepLauncherOpen:true}};
 for(const name of ['launcher_profiles.json','launcher_profiles_microsoft_store.json'])await fs.writeFile(path.join(mc,name),JSON.stringify(initial));
 await profile(mc,path.join(root,'instance'),path.join(bin,'java.exe'),6);
 for(const name of ['launcher_profiles.json','launcher_profiles_microsoft_store.json']){const actual=JSON.parse(await fs.readFile(path.join(mc,name),'utf8'));assert.equal(actual.profiles['pepaworld-3'].javaDir,path.join(bin,'javaw.exe'));assert.deepEqual(actual.profiles.otro,initial.profiles.otro);assert.deepEqual(actual.settings,initial.settings);assert.equal(actual.selectedProfile,'otro');}
});
