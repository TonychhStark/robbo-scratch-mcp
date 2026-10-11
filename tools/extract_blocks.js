// Extract block definitions from Robbo Scratch's scratch-blocks build using a fake Blockly.
const fs=require('fs'),vm=require('vm');
const SB=process.argv[2];
const mk=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'' :(t[k]!==undefined?t[k]:(t[k]=mk())),apply:()=>mk(),construct:()=>mk()});
const defs={}; let MSG;
function makeBlockly(){
  const B=mk();
  MSG={}; B.Msg=new Proxy(MSG,{set(o,k,v){o[k]=v;return true},get:(o,k)=>typeof k==='string'?'{{'+k+'}}':undefined}); B.ScratchMsgs={locales:{}};
  B.Blocks=new Proxy({}, {set(o,k,v){o[k]=v;return true}});
  B.Categories=new Proxy({}, {get:(t,k)=>k});
  B.Colours=mk(); B.Constants=mk(); B.Extensions=mk(); B.Extensions.register=()=>{}; B.Extensions.registerMixin=()=>{};
  B.mainWorkspace=mk();
  return B;
}
const B=makeBlockly();
const goog=mk(); goog.provide=()=>{}; goog.require=()=>{};
const strip=s=>s.replace(/^var (goog|Blockly) = require\([^)]*\);/mg,'');
const ctx={module:{exports:{}},exports:{},Blockly:B,goog,console,window:{},document:mk(),navigator:{userAgent:''}};
vm.createContext(ctx);
vm.runInContext(strip(fs.readFileSync(SB+'/msg/scratch_msgs.js','utf8')),ctx);
vm.runInContext(strip(fs.readFileSync(SB+'/msg/messages.js','utf8')),ctx);
const en=Object.assign({},MSG,B.ScratchMsgs.locales.en||{}), ru=B.ScratchMsgs.locales.ru||{};
vm.runInContext(strip(fs.readFileSync(SB+'/blocks_compressed_vertical.js','utf8')),ctx);
const out={};
for(const [op,d] of Object.entries(B.Blocks)){
  if(!d||typeof d.init!=='function') continue;
  let json=null;
  const fake=new Proxy({jsonInit(j){json=j}},{get:(t,k)=>k in t?t[k]:mk()});
  try{d.init.call(fake)}catch(e){out[op]={error:String(e)};continue}
  if(!json){out[op]={nojson:true};continue}
  // resolve function-based dropdowns
  for(const k of Object.keys(json)) if(/^args\d/.test(k)) for(const a of json[k]) if(typeof a.options==='function'){try{a.options=a.options.call(fake)}catch(e){a.options='dynamic'}}
  out[op]=json;
}
const res=(t,L)=>t.replace(/\{\{(\w+)\}\}/g,(m,k)=>L[k]!==undefined?L[k]:(en[k]!==undefined?en[k]:m));
const walk=(x,L)=>typeof x==='string'?res(x,L):Array.isArray(x)?x.map(y=>walk(y,L)):(x&&typeof x==='object')?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,walk(v,L)])):x;
for(const op of Object.keys(out)){const j=out[op]; const r={}; for(const k of Object.keys(j)) if(/^message\d/.test(k)) r[k]=res(j[k],ru); out[op]=walk(j,en); out[op].ru=r; out[op].ru_args={}; for(const k of Object.keys(j)) if(/^args\d/.test(k)) out[op].ru_args[k]=walk(j[k],ru);}
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));
console.log(Object.keys(out).length, Object.values(out).filter(x=>x.error||x.nojson).length);
