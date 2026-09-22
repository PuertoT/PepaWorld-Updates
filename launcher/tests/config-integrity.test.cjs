'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {normalizedConfigHash}=require('../src/content.cjs');
const {inspect,update,validate}=require('../src/updater.cjs');
const {build}=require('../tools/release.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function fixture(t){const root=await fs.mkdtemp(path.join(os.tmpdir(),'pepa-config-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));const home=path.join(root,'home'),game=path.join(root,'game'),bundled=path.join(root,'bundle');await fs.mkdir(path.join(game,'config'),{recursive:true});await fs.mkdir(path.join(bundled,'objects'),{recursive:true});return {root,home,game,bundled};}
function manifest(f,revision=4){return {schema:1,id:'pepaworld-3',version:'3.0.2',revision,minecraft:'1.21.1',neoforge:'21.1.250',files:[f]};}
test('Una configuración guardada como CRLF no pide reparación; los valores y archivos ausentes sí',async t=>{
 const ctx=await fixture(t),lf=Buffer.from('enabled=true\nlength=8\n'),crlf=Buffer.from('enabled=true\r\nlength=8\r\n');
 const f={path:'config/seasons.toml',sha256:sha(lf),size:lf.length,policy:'managed',textSha256:normalizedConfigHash(lf)},target=path.join(ctx.game,f.path);
 await fs.writeFile(path.join(ctx.bundled,'objects',f.sha256),lf);await fs.writeFile(target,crlf);
 const before=await inspect(ctx.home,ctx.game,manifest(f));assert.equal(before.changed,0);assert.deepEqual(before.changedFiles,[]);
 assert.deepEqual(await update({...ctx,manifest:manifest(f)}),{changed:0,removed:0});assert.deepEqual(await fs.readFile(target),crlf);
 await fs.writeFile(target,'enabled=true\r\nlength=12\r\n');const modified=await inspect(ctx.home,ctx.game,manifest(f));assert.deepEqual(modified.changedFiles,[{path:f.path,reason:'modified'}]);
 assert.equal((await update({...ctx,manifest:manifest(f)})).changed,1);assert.deepEqual(await fs.readFile(target),lf);
 await fs.rm(target);assert.deepEqual((await inspect(ctx.home,ctx.game,manifest(f))).changedFiles,[{path:f.path,reason:'missing'}]);
});
test('Migrar el manifest mantiene los cambios CRLF y conserva la protección de revisiones',async t=>{
 const ctx=await fixture(t),bytes=Buffer.from('value=1\n'),f={path:'config/a.toml',sha256:sha(bytes),size:bytes.length,policy:'managed'};
 await fs.writeFile(path.join(ctx.bundled,'objects',f.sha256),bytes);await update({...ctx,manifest:manifest(f,3)});
 await fs.writeFile(path.join(ctx.game,f.path),'value=1\r\n');assert.equal((await inspect(ctx.home,ctx.game,manifest(f,3))).changed,1);
 const next={...f,textSha256:normalizedConfigHash(bytes)};await assert.rejects(update({...ctx,manifest:manifest(next,3)}),/archivos distintos/);
 assert.deepEqual(await update({...ctx,manifest:manifest(next,4)}),{changed:0,removed:0});assert.equal((await inspect(ctx.home,ctx.game,manifest(next,4))).changed,0);
});
test('La equivalencia de saltos de línea no se permite para mods ni ignora otros bytes',()=>{
 const f={path:'mods/a.jar',sha256:'a'.repeat(64),size:1,policy:'managed',textSha256:'b'.repeat(64)};assert.throws(()=>validate(manifest(f)),/configuración/);
 assert.throws(()=>validate(manifest({...f,path:'config/a.toml',textSha256:'incorrecto'})),/configuración/);
 assert.notEqual(normalizedConfigHash(Buffer.from('a=1\n')),normalizedConfigHash(Buffer.from('a=2\n')));
 assert.notEqual(normalizedConfigHash(Buffer.from('a=1\n')),normalizedConfigHash(Buffer.from('a=1\r')));
});
test('El generador publica la huella normalizada manteniendo los bytes de descarga originales',async t=>{
 const ctx=await fixture(t),input=path.join(ctx.root,'client'),output=path.join(ctx.root,'release');await fs.mkdir(path.join(input,'config'),{recursive:true});await fs.mkdir(path.join(input,'mods'));
 const bytes=Buffer.from('setting=true\r\n');await fs.writeFile(path.join(input,'config/a.toml'),bytes);await fs.writeFile(path.join(input,'mods/a.jar'),'jar');
 const m=await build('3.0.2',4,input,output),f=m.files.find(f=>f.path==='config/a.toml');assert.equal(f.sha256,sha(bytes));assert.equal(f.textSha256,sha(Buffer.from('setting=true\n')));assert.deepEqual(await fs.readFile(path.join(output,'objects',f.sha256)),bytes);assert.equal(m.files.find(f=>f.path==='mods/a.jar').textSha256,undefined);
});
