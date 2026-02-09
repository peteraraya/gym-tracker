const fs = require('fs');
const path = require('path');
const enPath = path.resolve(__dirname, '..', 'messages', 'en.json');
const esPath = path.resolve(__dirname, '..', 'messages', 'es.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
function merge(src, target){
  for(const k of Object.keys(src)){
    if(typeof src[k] === 'string'){
      if(!(k in target)) target[k] = src[k];
    } else {
      if(!(k in target) || typeof target[k] !== 'object') target[k] = {};
      merge(src[k], target[k]);
    }
  }
}
merge(en, es);
fs.writeFileSync(esPath, JSON.stringify(es, null, 2), 'utf8');
console.log('MERGED');
