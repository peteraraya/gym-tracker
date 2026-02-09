const fs = require('fs');
const path = require('path');
const enPath = path.resolve(__dirname, '..', 'messages', 'en.json');
const esPath = path.resolve(__dirname, '..', 'messages', 'es.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
function flatten(obj, p=''){
  const res = {};
  for(const k of Object.keys(obj)){
    const key = p ? `${p}.${k}` : k;
    if(typeof obj[k] === 'string') res[key] = obj[k];
    else Object.assign(res, flatten(obj[k], key));
  }
  return res;
}
const fe = flatten(en);
const fses = flatten(es);
const missing = Object.keys(fe).filter(k => !(k in fses));
if(missing.length === 0){
  console.log('NO_MISSING');
  process.exit(0);
}
console.log(missing.join('\n'));
process.exit(0);
