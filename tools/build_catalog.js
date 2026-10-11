// Builds data/blocks.json — the single source of truth used by the compiler, validator and docs.
const fs=require('fs'),path=require('path');
const raw=require('./raw_blocks.json'), tb=require('./toolbox.json');
const PRIMS=JSON.parse(fs.readFileSync(__dirname+'/prims.json','utf8'));
const PRIMITIVE_SHADOWS=['math_number','math_positive_number','math_whole_number','math_integer','math_angle','colour_picker','text'];
const CAT_FIX={iot_trigger_on_topic:'iotblocks',iot_parse_data:'iotblocks'};
const catOfOp=op=>{const p=op.split('_')[0];return {robot:'robot',lab:'laboratory',copter:'quadcopter',otto:'otto',newcat:'newcat',iot:'iotblocks',motion:'motion',looks:'looks',sound:'sound',event:'events',control:'control',sensing:'sensing',operator:'operators',data:'data',procedures:'procedures',pen:'pen',argument:'procedures'}[p]||p};
const argsOf=j=>Object.keys(j).filter(k=>/^args\d+$/.test(k)).sort().flatMap(k=>j[k]);
const ruArgsOf=j=>Object.keys(j.ru_args||{}).sort().flatMap(k=>j.ru_args[k]);
function shapeOf(j){
  const e=j.extensions||[];
  if(e.includes('shape_hat')||j.nextStatement!==undefined&&j.previousStatement===undefined&&!e.includes('shape_statement')) return 'hat';
  if(e.includes('output_boolean')||j.output==='Boolean') return 'boolean';
  if(e.some(x=>x.startsWith('output_'))||j.output!==undefined) return 'reporter';
  const hasSub=argsOf(j).some(a=>a.type==='input_statement');
  if(e.includes('shape_end')) return hasSub?'c_end':'cap';
  if(hasSub) return 'c';
  return 'stack';
}
const msgText0=(j,ru)=>Object.keys(j).filter(k=>/^message\d+$/.test(k)).sort().map(k=>ru?(j.ru||{})[k]:j[k]).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function msgText(j,ru){
  const parts=[];
  for(const k of Object.keys(j).filter(k=>/^message\d+$/.test(k)).sort()){
    const n=k.slice(7); const m=ru?((j.ru||{})[k]||j[k]):j[k]; const args=(ru?(j.ru_args||{})['args'+n]:null)||j['args'+n]||[];
    parts.push(String(m).replace(/%(\d+)/g,(x,i)=>{const a=args[+i-1];if(!a)return '';if(a.type==='input_statement')return '{'+a.name+'}';if(a.type==='field_image'){return a.src&&/rotate-right/.test(a.src)?'↻':a.src&&/rotate-left/.test(a.src)?'↺':a.src&&/green-flag/.test(a.src)?'⚑':''}if(a.type==='field_vertical_separator')return '';return '['+a.name+']'}));
  }
  return parts.join(' ').replace(/\s+/g,' ').trim();
}
const DYNAMIC_MENUS=['looks_costume','looks_backdrops','sound_sounds_menu','sensing_of_object_menu','motion_goto_menu','motion_glideto_menu','motion_pointtowards_menu','sensing_touchingobjectmenu','sensing_distancetomenu','control_create_clone_of_menu'];
function menuInfo(type){
  const j=raw[type]; if(!j) return null;
  const a=argsOf(j), ra=ruArgsOf(j);
  if(a.length!==1) return null; const f=a[0], rf=ra[0]||f;
  if(f.type==='field_dropdown'){
    const opts=Array.isArray(f.options)?f.options.map((o,i)=>({value:o[1],en:typeof o[0]==='string'?o[0]:null,ru:Array.isArray(rf.options)&&typeof rf.options[i][0]==='string'?rf.options[i][0]:null})).filter(o=>o.value!==null):null;
    return {opcode:type,field:f.name,options:opts&&opts.length?opts:null,dynamic:!opts||!opts.length||DYNAMIC_MENUS.includes(type)};
  }
  if(f.type==='field_variable') return {opcode:type,field:f.name,variableType:(f.variableTypes||[''])[0]};
  return {opcode:type,field:f.name,fieldType:f.type};
}
const isMenu=op=>{const j=raw[op];if(!j)return false;const a=argsOf(j);return !j.category&&a.length===1&&(a[0].type==='field_dropdown'||a[0].type==='field_variable')&&shapeOf(j)==='reporter'};
const fixDefault=v=>typeof v==='string'&&v.includes('${')?({'${costumeName}':'костюм1','${backdropName}':'фон1','${soundName}':'звук1','${hello}':'Привет!','${hmm}':'Хмм...','${what}':'Как тебя зовут?','${apple}':'яблоко','${banana}':'банан'}[v]??''):v;
const MANUAL_INPUTS={
  data_setvariableto:{VALUE:{shadow:'text',default:'0'}},
  data_changevariableby:{VALUE:{shadow:'math_number',default:'1'}},
  data_addtolist:{ITEM:{shadow:'text',default:'вещь'}},
  data_deleteoflist:{INDEX:{shadow:'math_integer',default:'1'}},
  data_insertatlist:{ITEM:{shadow:'text',default:'вещь'},INDEX:{shadow:'math_integer',default:'1'}},
  data_replaceitemoflist:{INDEX:{shadow:'math_integer',default:'1'},ITEM:{shadow:'text',default:'вещь'}},
  data_itemoflist:{INDEX:{shadow:'math_integer',default:'1'}},
  data_itemnumoflist:{ITEM:{shadow:'text',default:'вещь'}},
  data_listcontainsitem:{ITEM:{shadow:'text',default:'вещь'}},
};
const REMOVED=['copter_fly_for_time_with_speed','copter_fly_for_seconds_to_coords']; // commented out in Robbo toolbox: "эти блоки доделать и вернуть"
const EXT='виден только если в Robbo Scratch включён «Набор расширений» (Extension pack) робота';
const SD='отсутствует у робота ScratchDuino (есть только у Robbo)';
const NOTES={robot_get_rgb_sensor_data:EXT,robot_is_current_color:EXT,robot_claw_closed:EXT,robot_claw_state:EXT,robot_motors_on_for_steps:SD,robot_reset_trip_meters:SD,robot_turnright:SD,robot_turnleft:SD,lab_external_sensor:'виден только если включены внешние датчики Лаборатории'};
const out={};
const ops=new Set([...Object.keys(tb),...Object.keys(raw).filter(k=>/^(data_|procedures_call|procedures_definition)/.test(k)),...Object.values(PRIMS).flat().filter(k=>raw[k])]);
for(const op of ops){
  const j=raw[op]; if(!j||j.error||j.nojson) continue; if(isMenu(op)) continue;
  if(/^(extension_|procedures_prototype|procedures_declaration|argument_)/.test(op)) continue;
  const t=tb[op]||{inputs:{},fields:{}};
  const a=argsOf(j), ra=ruArgsOf(j);
  const e={opcode:op,category:CAT_FIX[op]||(/^(robot|lab|copter|otto|newcat|iot)_/.test(op)?catOfOp(op):(t.category||catOfOp(op))),shape:shapeOf(j),ru:msgText(j,true),en:msgText(j,false),inputs:[],fields:[]};
  a.forEach((x,i)=>{
    const rx=ra[i]||x;
    if(x.type==='input_statement'){e.inputs.push({name:x.name,kind:'statement'});return}
    if(x.type==='input_value'){
      const ti=(t.inputs||{})[x.name]||{}; const m=MANUAL_INPUTS[op]&&MANUAL_INPUTS[op][x.name];
      const inp={name:x.name,kind:x.check==='Boolean'?'boolean':'value'};
      const sh=ti.shadow; const blk=ti.block;
      if(m){inp.shadow=m.shadow;inp.default=m.default}
      else if(sh){
        inp.shadow=sh.type;
        if(PRIMITIVE_SHADOWS.includes(sh.type)){ inp.default=fixDefault(Object.values(sh.fields)[0]??''); if(sh.type==='colour_picker'&&!/^#[0-9a-fA-F]{6}$/.test(inp.default)) inp.default='#ff0000'; }
        else{const mi=menuInfo(sh.type); if(mi){inp.menu=mi; const fv=sh.fields[mi.field]; inp.default=fv!==undefined?fixDefault(fv):(mi.options?mi.options[0].value:'');}}
      }
      if(blk) inp.toolboxBlock=blk.type;
      e.inputs.push(inp);return;
    }
    if(x.type==='field_dropdown'){const opts=Array.isArray(x.options)?x.options.map((o,k)=>({value:o[1],en:typeof o[0]==='string'?o[0]:null,ru:Array.isArray(rx.options)&&rx.options[k]&&typeof rx.options[k][0]==='string'?rx.options[k][0]:null})).filter(o=>o.value!=null):null;
      e.fields.push({name:x.name,kind:'dropdown',options:opts,default:(t.fields||{})[x.name]??(opts&&opts[0]?opts[0].value:'')});return}
    if(x.type==='field_variable'||x.type==='field_variable_getter'){const vt=(x.variableTypes||[''])[0];e.fields.push({name:x.name,kind:vt==='list'?'list':vt==='broadcast_msg'?'broadcast':'variable'});return}
    if(['field_image','field_vertical_separator','field_label_serializable'].includes(x.type)) return;
    e.fields.push({name:x.name,kind:x.type});
  });
  const dev=Object.entries(PRIMS).find(([k,v])=>v.includes(op));
  e.inPalette=!!tb[op]||/^data_/.test(op);
  if(dev) e.device=dev[0];
  if(REMOVED.includes(op)) continue;
  if(NOTES[op]) e.note=NOTES[op];
  if(!e.inPalette) continue; // hidden/experimental blocks are not offered to the AI
  out[op]=e;
}
// Pen extension (defined in VM extension, not in scratch-blocks)
const colorParam={opcode:'pen_menu_colorParam',field:'colorParam',options:[{value:'color',ru:'цвет',en:'color'},{value:'saturation',ru:'насыщенность',en:'saturation'},{value:'brightness',ru:'яркость',en:'brightness'},{value:'transparency',ru:'прозрачность',en:'transparency'}]};
const pen=(op,ru,en,inputs=[])=>out[op]={opcode:op,category:'pen',shape:'stack',ru,en,inputs,fields:[],extension:'pen',inPalette:true};
pen('pen_clear','стереть всё','erase all');pen('pen_stamp','печать','stamp');pen('pen_penDown','опустить перо','pen down');pen('pen_penUp','поднять перо','pen up');
pen('pen_setPenColorToColor','установить для пера цвет %1','set pen color to %1',[{name:'COLOR',kind:'value',shadow:'colour_picker',default:'#ff0000'}]);
pen('pen_changePenColorParamBy','изменить %1 пера на %2','change pen %1 by %2',[{name:'COLOR_PARAM',kind:'value',shadow:'pen_menu_colorParam',menu:colorParam,default:'color'},{name:'VALUE',kind:'value',shadow:'math_number',default:'10'}]);
pen('pen_setPenColorParamTo','установить перо %1 в %2','set pen %1 to %2',[{name:'COLOR_PARAM',kind:'value',shadow:'pen_menu_colorParam',menu:colorParam,default:'color'},{name:'VALUE',kind:'value',shadow:'math_number',default:'50'}]);
pen('pen_changePenSizeBy','изменить размер пера на %1','change pen size by %1',[{name:'SIZE',kind:'value',shadow:'math_number',default:'1'}]);
pen('pen_setPenSizeTo','установить размер пера %1','set pen size to %1',[{name:'SIZE',kind:'value',shadow:'math_number',default:'1'}]);
// control_stop (custom init in scratch-blocks)
out.control_stop={opcode:'control_stop',category:'control',shape:'cap',ru:'стоп [STOP_OPTION]',en:'stop [STOP_OPTION]',inputs:[],fields:[{name:'STOP_OPTION',kind:'dropdown',options:[{value:'all',ru:'все',en:'all'},{value:'this script',ru:'этот скрипт',en:'this script'},{value:'other scripts in sprite',ru:'другие скрипты спрайта',en:'other scripts in sprite'}],default:'all'}],inPalette:true};
const order=['robot','laboratory','quadcopter','otto','newcat','iotblocks','motion','looks','sound','events','control','sensing','operators','data','data-lists','procedures','pen'];
const sorted=Object.fromEntries(Object.entries(out).sort((x,y)=>order.indexOf(x[1].category)-order.indexOf(y[1].category)));
fs.mkdirSync(path.join(__dirname,'../data'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../data/blocks.json'),JSON.stringify(sorted,null,1));
const c={};for(const v of Object.values(sorted))c[v.category]=(c[v.category]||0)+1;console.log(Object.keys(sorted).length,c);
