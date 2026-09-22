'use strict';
const crypto=require('node:crypto');
const supportsTextHash=p=>/^config\/.+\.toml$/.test(p);
function normalizedConfigHash(bytes){
 const out=Buffer.allocUnsafe(bytes.length);let n=0;
 // Solo equipara CRLF y LF; conserva valores, espacios y cualquier otro byte.
 for(let i=0;i<bytes.length;i++){if(bytes[i]===13&&bytes[i+1]===10)continue;out[n++]=bytes[i];}
 return crypto.createHash('sha256').update(out.subarray(0,n)).digest('hex');
}
module.exports={supportsTextHash,normalizedConfigHash};
