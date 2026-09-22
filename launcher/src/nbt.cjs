'use strict';
const zlib=require('node:zlib');
function mutfEncode(s){const a=[];for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>0&&c<=127)a.push(c);else if(c<=2047)a.push(192|(c>>6),128|(c&63));else a.push(224|(c>>12),128|((c>>6)&63),128|(c&63));}if(a.length>65535)throw Error('Cadena NBT demasiado larga');return Buffer.from(a);}
function mutfDecode(b){let s='';for(let i=0;i<b.length;){const c=b[i++];if(c<128)s+=String.fromCharCode(c);else if((c&224)===192){if(i>=b.length)throw Error('Cadena NBT truncada');s+=String.fromCharCode(((c&31)<<6)|(b[i++]&63));}else if((c&240)===224){if(i+1>=b.length)throw Error('Cadena NBT truncada');s+=String.fromCharCode(((c&15)<<12)|((b[i++]&63)<<6)|(b[i++]&63));}else throw Error('Codificación NBT inválida');}return s;}
// Conserva las etiquetas NBT desconocidas al añadir el servidor.
function decode(input) {
 let b=input[0]===31&&input[1]===139?zlib.gunzipSync(input,{maxOutputLength:16*1024*1024}):input,o=0;
 const take=n=>{if(n<0||o+n>b.length)throw Error('servers.dat truncado');const v=b.subarray(o,o+n);o+=n;return v;};
 const num=n=>{const q=take(n);return n===1?q.readUInt8():n===2?q.readUInt16BE():q.readInt32BE();};
 const str=()=>mutfDecode(take(num(2)));
 function val(t,depth=0){if(depth>64)throw Error('NBT demasiado profundo');
  if([1,2,3,4,5,6].includes(t))return take([0,1,2,4,8,4,8][t]);
  if(t===8)return str();
  if(t===10){const a=[];let type;while((type=num(1))!==0)a.push({type,name:str(),value:val(type,depth+1)});return a;}
  if(t===9){const type=num(1),n=num(4);if(n<0||n>100000)throw Error('Lista NBT inválida');return {type,items:Array.from({length:n},()=>val(type,depth+1))};}
  if([7,11,12].includes(t)){const n=num(4);if(n<0||n>10000000)throw Error('Array NBT inválido');return {n,data:take(n*({7:1,11:4,12:8}[t]))};}throw Error('Tipo NBT inválido');
 }
 const type=num(1),name=str(),value=val(type);if(type!==10||o!==b.length)throw Error('NBT raíz inválido');return {type,name,value};
}
function encode(root){
 const chunks=[];const n=(v,s)=>{const b=Buffer.alloc(s);s===1?b.writeUInt8(v):s===2?b.writeUInt16BE(v):b.writeInt32BE(v);chunks.push(b);};const s=v=>{const b=mutfEncode(v);n(b.length,2);chunks.push(b);};
 function v(t,a){if([1,2,3,4,5,6].includes(t))chunks.push(a);else if(t===8)s(a);else if(t===10){for(const x of a){n(x.type,1);s(x.name);v(x.type,x.value);}n(0,1);}else if(t===9){n(a.type,1);n(a.items.length,4);for(const x of a.items)v(a.type,x);}else{n(a.n,4);chunks.push(a.data);}}
 n(root.type,1);s(root.name);v(root.type,root.value);return Buffer.concat(chunks);
}
function addServer(bytes){const root=bytes?decode(bytes):{type:10,name:'',value:[]};let servers=root.value.find(x=>x.name==='servers');
 if(!servers){servers={type:9,name:'servers',value:{type:10,items:[]}};root.value.push(servers);}if(servers.type===9&&servers.value.type===0&&servers.value.items.length===0)servers.value.type=10;if(servers.type!==9||servers.value.type!==10)throw Error('Lista de servidores inválida');
 let entry=servers.value.items.find(a=>a.some(x=>x.name==='ip'&&x.type===8&&x.value==='45.43.163.21:25570'));
 if(!entry){entry=[{type:8,name:'ip',value:'45.43.163.21:25570'}];servers.value.items.push(entry);}
 const name=entry.find(x=>x.name==='name');if(name){name.type=8;name.value='PepaWorld 3.0';}else entry.push({type:8,name:'name',value:'PepaWorld 3.0'});
 return encode(root);
}
module.exports={decode,encode,addServer};
