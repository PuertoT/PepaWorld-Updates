'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { createReadStream, createWriteStream } = require('node:fs');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { spawn } = require('node:child_process');
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function json(p, fallback) { try { return JSON.parse(await fs.readFile(p,'utf8')); } catch(e) { if(e.code==='ENOENT' && fallback!==undefined) return fallback; throw e; } }
async function atomic(p, data) {
  await fs.mkdir(path.dirname(p), {recursive:true});
  const tmp=p+'.'+crypto.randomUUID()+'.tmp';
  try { await fs.writeFile(tmp, data); await fs.rename(tmp,p); } finally { await fs.rm(tmp,{force:true}); }
}
const writeJson=(p,v)=>atomic(p,JSON.stringify(v,null,2)+'\n');
async function hash(p, algorithm='sha256') { const h=crypto.createHash(algorithm); for await(const b of createReadStream(p)) h.update(b); return h.digest('hex'); }
function secureUrl(input) { const u=new URL(input); if(u.protocol!=='https:' || u.username || u.password) throw Error('La descarga requiere una URL HTTPS sin credenciales.'); return u; }
async function response(url, timeout=120000) {
  const r=await fetch(secureUrl(url), {signal:AbortSignal.timeout(timeout),redirect:'manual'});
  if([301,302,303,307,308].includes(r.status)) throw Error('Redirección inesperada.');
  if(!r.ok) throw Error(`Error de descarga HTTP ${r.status}: ${new URL(url).hostname}`);
  return r;
}
async function redirected(url, timeout=120000) {
  for(let i=0;i<8;i++) { const u=secureUrl(url); const r=await fetch(u,{signal:AbortSignal.timeout(timeout),redirect:'manual'});
    if([301,302,303,307,308].includes(r.status)) { const l=r.headers.get('location'); await r.body?.cancel(); if(!l) throw Error('Redirección vacía'); url=new URL(l,u).href; continue; }
    if(!r.ok) throw Error(`Error de descarga HTTP ${r.status}: ${u.hostname}`); return r;
  } throw Error('Demasiadas redirecciones.');
}
async function remoteJson(url) { const r=await redirected(url,45000); const b=await r.text(); if(b.length>12*1024*1024) throw Error('Manifest demasiado grande.'); return JSON.parse(b); }
async function download(url, target, expected, size, log=()=>{}, algorithm='sha256') {
  if(expected && await exists(target) && await hash(target,algorithm)===expected) return;
  await fs.mkdir(path.dirname(target),{recursive:true}); const tmp=target+'.partial';
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const r=await redirected(url); const h=crypto.createHash(algorithm); let count=0;
      const meter=new Transform({transform(c,e,cb){count+=c.length;h.update(c);if(size && count>size) cb(Error('Descarga mayor que el tamaño declarado.'));else cb(null,c);}});
      await pipeline(Readable.fromWeb(r.body),meter,createWriteStream(tmp));
      if(size!==undefined && size!==null && count!==size) throw Error('Descarga incompleta.');
      if(expected && h.digest('hex')!==expected) throw Error('La huella del archivo no coincide.');
      await fs.rename(tmp,target); return;
    } catch(e) { await fs.rm(tmp,{force:true}); if(attempt===2) throw e; log('Reintentando descarga…'); }
  }
}
function safeRelative(p) {
  if(typeof p!=='string' || p.length>240 || !p || p.includes('\\') || /[:\x00-\x1f<>"|?*]/.test(p) || p.startsWith('/') || p.split('/').some(s=>!s||s==='.'||s==='..'||/[. ]$/.test(s)||/^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(s))) throw Error('Ruta de archivo no permitida: '+p);
  return p;
}
async function safeTarget(root, rel) {
  safeRelative(rel); const base=path.resolve(root); let current=base;
  // Rechaza enlaces y junctions, también en los padres de la instancia.
  let ancestor=base;
  while(true) { try {if((await fs.lstat(ancestor)).isSymbolicLink()) throw Error('Carpeta enlazada no permitida: '+ancestor);}catch(e){if(e.code!=='ENOENT')throw e;} const parent=path.dirname(ancestor);if(parent===ancestor)break;ancestor=parent; }
  for(const part of rel.split('/')) { current=path.join(current,part); try {if((await fs.lstat(current)).isSymbolicLink())throw Error('Enlace no permitido: '+current);}catch(e){if(e.code!=='ENOENT')throw e;} }
  return current;
}
function run(exe,args,options={}) { return new Promise((resolve,reject)=>{
  const child=spawn(exe,args,{cwd:options.cwd,env:options.env||process.env,windowsHide:true,shell:false});
  let output=''; const timer=setTimeout(()=>{child.kill();reject(Error('El proceso ha excedido el tiempo de espera.'));},options.timeout||20*60*1000);
  child.stdout.on('data',d=>{output=(output+d.toString()).slice(-20000);options.log?.(d.toString());});child.stderr.on('data',d=>{output=(output+d.toString()).slice(-20000);options.log?.(d.toString());});
  child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',c=>{clearTimeout(timer);c===0?resolve(output):reject(Error(`El proceso terminó con código ${c}.\n${output.slice(-3000)}`));});
}); }
module.exports={exists,json,atomic,writeJson,hash,secureUrl,remoteJson,download,safeRelative,safeTarget,run};
