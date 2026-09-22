'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{EventEmitter}=require('node:events');
const su=require('../src/self-update.cjs');
function manifest(bytes=Buffer.from('verified installer'),version='0.2.0'){return {schema:1,id:'pepaworld-launcher',version,assets:{'win32-x64':{url:`https://github.com/PuertoT/PepaWorld-Updates/releases/download/launcher-v${version}/PepaWorld-${version}-win-x64.exe`,size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}}};}
test('Detecta versiones superiores por números y rechaza versiones ambiguas',async()=>{
 assert.equal(su.compareVersions('0.2.10','0.2.9'),1);assert.equal(su.compareVersions('1.0.0','0.99.99'),1);assert.equal(su.compareVersions('0.2.0','0.2.0'),0);
 for(const v of ['../../x','0.2','0.2.0-beta','01.2.3','999999999.0.0'])assert.throws(()=>su.versionParts(v));
 assert.equal((await su.check('0.1.4','win32','x64',async()=>manifest())).available,true);
 assert.equal((await su.check('0.2.0','win32','x64',async()=>manifest())).available,false);
 assert.equal((await su.check('0.3.0','win32','x64',async()=>manifest())).available,false);
 assert.equal((await su.check('0.1.4','darwin','arm64',async()=>{throw Error('No debe consultar');})).supported,false);
});
test('Rechaza instaladores ajenos, hashes inválidos y tamaños fuera del límite',()=>{
 for(const url of ['http://github.com/x.exe','https://example.com/x.exe','https://github.com/otro/repo/releases/download/v1/x.exe',manifest().assets['win32-x64'].url+'?redirect=x']){const m=manifest();m.assets['win32-x64'].url=url;assert.throws(()=>su.validate(m));}
 for(const size of [0,-1,1.5,1024**3+1]){const m=manifest();m.assets['win32-x64'].size=size;assert.throws(()=>su.validate(m));}
 const m=manifest();m.assets['win32-x64'].sha256='incorrecto';assert.throws(()=>su.validate(m));
});
test('Descarga verificada, reutilización, rechazo de corrupción y ejecución sin shell',async t=>{
 const home=await fs.mkdtemp(path.join(os.tmpdir(),'pepa-self-update-'));t.after(()=>fs.rm(home,{recursive:true,force:true}));const original=global.fetch;t.after(()=>{global.fetch=original;});
 const bytes=Buffer.from('verified installer'),m=manifest(bytes);let requests=0;global.fetch=async()=>{requests++;return new Response(bytes);};
 const options={home,currentVersion:'0.1.4',manifest:m,platform:'win32',arch:'x64'};const ready=await su.prepare(options);await su.prepare(options);assert.equal(requests,1);
 await assert.rejects(su.prepare({...options,currentVersion:'0.2.0'}),/más reciente/);
 let launched=false;await su.launch(ready,(file,args,opts)=>{assert.equal(file,ready.file);assert.deepEqual(args,[]);assert.equal(opts.shell,false);const child=new EventEmitter();child.unref=()=>{launched=true;};queueMicrotask(()=>child.emit('spawn'));return child;});assert.equal(launched,true);
 await su.launch(ready,()=>{const child=new EventEmitter();queueMicrotask(()=>child.emit('error',Error('No se puede abrir')));return child;}).then(()=>assert.fail(),e=>assert.match(e.message,/No se puede abrir/));
 await fs.writeFile(ready.file,'tampered');await assert.rejects(su.launch(ready,()=>{assert.fail('No ejecutar un instalador alterado');}),/integridad/);
 global.fetch=async()=>new Response('corrupt');await assert.rejects(su.prepare(options));
});
