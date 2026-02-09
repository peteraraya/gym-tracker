const fs = require('fs');
const path = require('path');
const enPath = path.resolve(__dirname, '..', 'messages', 'en.json');
const esPath = path.resolve(__dirname, '..', 'messages', 'es.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
function flatten(o,p=''){const r={};for(const k of Object.keys(o)){const key=p?`${p}.${k}`:k;if(typeof o[k]==='string')r[key]=o[k];else Object.assign(r,flatten(o[k],key));}return r}
const fe=flatten(en);const fses=flatten(es);
const same=Object.keys(fe).filter(k=>fe[k]===fses[k]);
if(same.length===0){console.log('NO_SAME');process.exit(0);}console.log(same.join('\n'));
