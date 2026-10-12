'use strict';
// Robbo-JSON (simple program description) -> Scratch 3 project.json + assets -> .sb3
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { BLOCKS, PRIMITIVE, resolveOption, suggestOpcodes } = require('./catalog');
const { createZip } = require('./zip');

const ASSET_DIR = path.join(__dirname, '..', 'assets');

const DEFAULT_COSTUMES = [
  { assetId: 'f8e72b8244738d0b448e46b38c5db6c2', name: 'костюм1', rotationCenterX: 67, rotationCenterY: 95 },
  { assetId: 'bb3a866c4db08353f6faf43c54990f10', name: 'костюм2', rotationCenterX: 67, rotationCenterY: 95 },
  { assetId: 'bb6b82c9fa7c432c552ca2f251ae2078', name: 'костюм3', rotationCenterX: 67, rotationCenterY: 95 },
  { assetId: 'be2345a4417ff516f9c1a5ece86a8c64', name: 'костюм4', rotationCenterX: 67, rotationCenterY: 95 },
].map(c => ({ ...c, md5ext: c.assetId + '.svg', dataFormat: 'svg', bitmapResolution: 1 }));
const DEFAULT_BACKDROP = { assetId: 'cd21514d0531fdffb22204e0ec5ed84a', name: 'фон1', md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg', dataFormat: 'svg', rotationCenterX: 240, rotationCenterY: 180 };
const SOUND_POP = { assetId: '83a9787d4cb6f3b7632b4ddfebf74367', name: 'хлопок', dataFormat: 'wav', format: '', rate: 11025, sampleCount: 258, md5ext: '83a9787d4cb6f3b7632b4ddfebf74367.wav' };
const SOUND_BEEP = { assetId: '28c76b6bebd04be1383fe9ba4933d263', name: 'сигнал', dataFormat: 'wav', format: '', rate: 11025, sampleCount: 9536, md5ext: '28c76b6bebd04be1383fe9ba4933d263.wav' };

const SPRITE_KEYS = ['name', 'x', 'y', 'size', 'direction', 'visible', 'draggable', 'rotationStyle', 'currentCostume', 'costumes', 'sounds', 'variables', 'lists', 'scripts', 'procedures', 'layerOrder', 'volume'];

class CompileError extends Error {
  constructor(errors, warnings) {
    super('Ошибки в описании программы:\n' + errors.map(e => ' - ' + e).join('\n'));
    this.errors = errors; this.warnings = warnings;
  }
}

function compile(spec, opts = {}) {
  if (typeof spec === 'string') spec = JSON.parse(spec);
  const baseDir = opts.baseDir || process.cwd();
  const errors = [], warnings = [];
  const assets = new Map(); // md5ext -> Buffer
  let idCounter = 0;
  const newId = () => 'rb' + (idCounter++).toString(36).padStart(3, '0') + crypto.createHash('md5').update('robbo' + idCounter).digest('hex').slice(0, 10);

  // ---------- normalize top-level ----------
  if (!spec || typeof spec !== 'object') throw new CompileError(['Описание программы должно быть JSON-объектом'], []);
  let sprites = spec.sprites;
  if (!sprites && (spec.scripts || spec.procedures)) sprites = [{ name: 'Спрайт1', scripts: spec.scripts, procedures: spec.procedures }];
  if (!sprites) sprites = [{ name: 'Спрайт1', scripts: [] }];
  if (!Array.isArray(sprites)) throw new CompileError(['"sprites" должен быть массивом'], []);
  const stageSpec = spec.stage || {};

  // ---------- stage (globals) ----------
  const stage = {
    isStage: true, name: 'Stage', variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
    currentCostume: 0, costumes: [], sounds: [], volume: 100, layerOrder: 0,
    tempo: 60, videoTransparency: 50, videoState: 'on', textToSpeechLanguage: null,
  };
  const globalVars = new Map(), globalLists = new Map(), broadcasts = new Map();
  const addVar = (target, map, name, value) => { const id = newId(); map.set(name, id); target.variables[id] = [name, value]; return id; };
  const addList = (target, map, name, value) => { const id = newId(); map.set(name, id); target.lists[id] = [name, value]; return id; };
  for (const [n, v] of Object.entries(spec.variables || {})) addVar(stage, globalVars, n, v);
  for (const [n, v] of Object.entries(spec.lists || {})) addList(stage, globalLists, n, Array.isArray(v) ? v : []);
  const getBroadcast = name => {
    name = String(name);
    if (!broadcasts.has(name)) { const id = newId(); broadcasts.set(name, id); stage.broadcasts[id] = name; }
    return broadcasts.get(name);
  };
  for (const b of spec.broadcasts || []) getBroadcast(b);

  // ---------- assets ----------
  const loadDefault = c => { assets.set(c.md5ext, fs.readFileSync(path.join(ASSET_DIR, c.md5ext))); return { ...c }; };
  function loadCostume(c, where) {
    if (c === 'default') return null;
    if (!c.file) { errors.push(`${where}: у костюма нужен "file" (путь к .svg/.png) — или не указывайте costumes, тогда будут стандартные`); return null; }
    const file = path.resolve(baseDir, c.file);
    if (!fs.existsSync(file)) { errors.push(`${where}: файл не найден: ${file}`); return null; }
    const data = fs.readFileSync(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    if (!['svg', 'png', 'jpg', 'jpeg'].includes(ext)) { errors.push(`${where}: поддерживаются только svg/png/jpg`); return null; }
    const fmt = ext === 'jpeg' ? 'jpg' : ext;
    const md5 = crypto.createHash('md5').update(data).digest('hex');
    let w = 100, h = 100;
    if (fmt === 'svg') {
      const s = data.toString('utf8');
      const vb = s.match(/viewBox\s*=\s*"[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
      const ww = s.match(/<svg[^>]*\swidth\s*=\s*"([\d.]+)/), hh = s.match(/<svg[^>]*\sheight\s*=\s*"([\d.]+)/);
      if (ww && hh) { w = +ww[1]; h = +hh[1]; } else if (vb) { w = +vb[1]; h = +vb[2]; }
    } else if (fmt === 'png') { w = data.readUInt32BE(16); h = data.readUInt32BE(20); }
    assets.set(`${md5}.${fmt}`, data);
    const res = fmt === 'svg' ? 1 : 2;
    return {
      assetId: md5, name: c.name || path.basename(file, path.extname(file)), md5ext: `${md5}.${fmt}`, dataFormat: fmt,
      bitmapResolution: res,
      rotationCenterX: c.rotationCenterX ?? Math.round(w / 2) * (fmt === 'svg' ? 1 : res),
      rotationCenterY: c.rotationCenterY ?? Math.round(h / 2) * (fmt === 'svg' ? 1 : res),
    };
  }
  function loadSound(s, where) {
    if (!s.file) { errors.push(`${where}: у звука нужен "file" (путь к .wav)`); return null; }
    const file = path.resolve(baseDir, s.file);
    if (!fs.existsSync(file)) { errors.push(`${where}: файл не найден: ${file}`); return null; }
    const data = fs.readFileSync(file);
    if (path.extname(file).toLowerCase() !== '.wav') { errors.push(`${where}: поддерживается только .wav`); return null; }
    let rate = 44100, sampleCount = 0, p = 12, blockAlign = 2;
    while (p + 8 <= data.length) {
      const id = data.toString('ascii', p, p + 4), size = data.readUInt32LE(p + 4);
      if (id === 'fmt ') { rate = data.readUInt32LE(p + 12); blockAlign = data.readUInt16LE(p + 20) || 2; }
      if (id === 'data') sampleCount = Math.floor(size / blockAlign);
      p += 8 + size + (size % 2);
    }
    const md5 = crypto.createHash('md5').update(data).digest('hex');
    assets.set(`${md5}.wav`, data);
    return { assetId: md5, name: s.name || path.basename(file, '.wav'), dataFormat: 'wav', format: '', rate, sampleCount, md5ext: `${md5}.wav` };
  }
  function buildCostumes(list, isStage, where) {
    if (!list || list === 'default') return isStage ? [loadDefault(DEFAULT_BACKDROP)] : DEFAULT_COSTUMES.map(loadDefault);
    const out = [];
    list.forEach((c, i) => { const r = loadCostume(c, `${where} костюм #${i + 1}`); if (r) out.push(r); });
    if (!out.length) return isStage ? [loadDefault(DEFAULT_BACKDROP)] : DEFAULT_COSTUMES.map(loadDefault);
    return out;
  }
  function buildSounds(list, isStage, where) {
    if (!list || list === 'default') return [loadDefault(isStage ? SOUND_POP : SOUND_BEEP)];
    const out = [];
    list.forEach((s, i) => { const r = loadSound(s, `${where} звук #${i + 1}`); if (r) out.push(r); });
    return out;
  }

  // ---------- block compilation ----------
  function compileTarget(target, tspec, where, localVars, localLists) {
    const blocks = target.blocks;
    const isStage = target.isStage;
    const procs = new Map(); // name -> {proccode, argIds, argNames, argTypes, warp}

    const findVar = (name, kind, at) => {
      name = String(name);
      const local = kind === 'list' ? localLists : localVars, global = kind === 'list' ? globalLists : globalVars;
      if (local && local.has(name)) return local.get(name);
      if (global.has(name)) return global.get(name);
      warnings.push(`${at}: ${kind === 'list' ? 'список' : 'переменная'} "${name}" не объявлен(а) — создан(а) автоматически как общая (для всех спрайтов)`);
      return kind === 'list' ? addList(stage, globalLists, name, []) : addVar(stage, globalVars, name, 0);
    };

    // procedures: first pass — prototypes
    const procSpecs = tspec.procedures || [];
    procSpecs.forEach((p, i) => {
      const at = `${where} procedures[${i}]`;
      if (!p || !p.name) { errors.push(`${at}: у процедуры нужен "name"`); return; }
      const params = (p.params || []).map(x => typeof x === 'string' ? { name: x, type: 'number' } : x);
      const argIds = params.map(() => newId());
      const proccode = [p.name, ...params.map(x => (x.type === 'boolean' ? '%b' : '%s'))].join(' ');
      procs.set(p.name, { proccode, argIds, argNames: params.map(x => x.name), argTypes: params.map(x => x.type === 'boolean' ? 'boolean' : 'string'), warp: !!p.warp, params });
    });

    const isLiteral = v => v === null || ['string', 'number', 'boolean'].includes(typeof v);

    function shadowFor(input, value, at, parentId) {
      // returns compressed primitive array or a shadow block id
      if (input.shadow && PRIMITIVE[input.shadow] !== undefined) {
        let v = value === undefined || value === null ? (input.default ?? '') : value;
        if (typeof v === 'boolean') v = v ? 'true' : 'false';
        if (input.shadow === 'colour_picker' && !/^#[0-9a-fA-F]{6}$/.test(String(v))) {
          errors.push(`${at}: цвет должен быть в виде "#rrggbb", получено ${JSON.stringify(v)}`); v = '#ff0000';
        }
        if (['math_number', 'math_positive_number', 'math_whole_number', 'math_integer', 'math_angle'].includes(input.shadow) && value !== undefined && isNaN(Number(v)))
          warnings.push(`${at}: в числовое поле передан текст ${JSON.stringify(v)}`);
        return [PRIMITIVE[input.shadow], String(v)];
      }
      if (input.menu) {
        const m = input.menu;
        let v = value === undefined || value === null ? input.default : value;
        if (m.variableType === 'broadcast_msg') {
          if (v === undefined || v === '') v = 'сообщение1';
          return [11, String(v), getBroadcast(v)];
        }
        if (m.options && !m.dynamic) {
          const r = resolveOption(m.options, v);
          if (!r.ok) errors.push(`${at}: недопустимое значение ${JSON.stringify(v)} для ${input.name}. Допустимо: ${m.options.map(o => `"${o.value}" (${o.ru || o.en})`).join(', ')}`);
          v = r.value;
        } else if (m.options) {
          v = resolveOption(m.options, v).value;
        }
        const id = newId();
        blocks[id] = { opcode: m.opcode, next: null, parent: parentId, inputs: {}, fields: { [m.field]: [String(v), null] }, shadow: true, topLevel: false };
        return id;
      }
      if (input.kind === 'value') { // no declared shadow -> plain text
        const v = value === undefined || value === null ? '' : value;
        return [10, String(v)];
      }
      return null;
    }

    function compileReporterRef(node, at, parentId, opts = {}) {
      // returns either compressed var/list array or block id
      if (node.var !== undefined && Object.keys(node).length === 1) { const id = findVar(node.var, 'var', at); return [12, String(node.var), id]; }
      if (node.list !== undefined && Object.keys(node).length === 1) { const id = findVar(node.list, 'list', at); return [13, String(node.list), id]; }
      return compileBlock(node, at, parentId, 'reporter', opts);
    }

    function compileBlock(node, at, parentId, ctxKind, opts = {}) {
      if (!node || typeof node !== 'object' || Array.isArray(node)) { errors.push(`${at}: ожидался блок вида {"op": "..."}, получено ${JSON.stringify(node)}`); return null; }
      const id = newId();
      // shorthand: argument reporter
      if (node.arg !== undefined) {
        const proc = opts.proc;
        let isBool = false;
        if (!proc || !proc.argNames.includes(node.arg)) errors.push(`${at}: параметр "${node.arg}" можно использовать только внутри своей процедуры`);
        else isBool = proc.argTypes[proc.argNames.indexOf(node.arg)] === 'boolean';
        blocks[id] = { opcode: isBool ? 'argument_reporter_boolean' : 'argument_reporter_string_number', next: null, parent: parentId, inputs: {}, fields: { VALUE: [String(node.arg), null] }, shadow: false, topLevel: false };
        return id;
      }
      if (node.var !== undefined || node.list !== undefined) {
        const isList = node.list !== undefined;
        const name = isList ? node.list : node.var;
        const vid = findVar(name, isList ? 'list' : 'var', at);
        blocks[id] = { opcode: isList ? 'data_listcontents' : 'data_variable', next: null, parent: parentId, inputs: {}, fields: { [isList ? 'LIST' : 'VARIABLE']: [String(name), vid] }, shadow: false, topLevel: false };
        return id;
      }
      let op = node.op || node.opcode;
      if (!op) { errors.push(`${at}: у блока нет "op". Получено: ${JSON.stringify(node).slice(0, 120)}`); return null; }
      if (op === 'call') op = 'procedures_call';

      // ----- procedure call -----
      if (op === 'procedures_call') {
        const proc = procs.get(node.proc);
        if (!proc) { errors.push(`${at}: процедура "${node.proc}" не объявлена в "procedures" этого спрайта${procs.size ? '. Есть: ' + [...procs.keys()].join(', ') : ''}`); return null; }
        if (ctxKind !== 'stack') errors.push(`${at}: вызов процедуры — это команда, её нельзя вставлять в поле`);
        const b = { opcode: 'procedures_call', next: null, parent: parentId, inputs: {}, fields: {}, shadow: false, topLevel: false,
          mutation: { tagName: 'mutation', children: [], proccode: proc.proccode, argumentids: JSON.stringify(proc.argIds), warp: String(proc.warp) } };
        blocks[id] = b;
        const args = Array.isArray(node.args) ? Object.fromEntries(proc.argNames.map((n, i) => [n, node.args[i]])) : (node.args || {});
        for (const k of Object.keys(args)) if (!proc.argNames.includes(k)) errors.push(`${at}: у процедуры "${node.proc}" нет параметра "${k}". Есть: ${proc.argNames.join(', ')}`);
        proc.argNames.forEach((n, i) => {
          const v = args[n], aid = proc.argIds[i];
          if (proc.argTypes[i] === 'boolean') {
            if (v === undefined) return;
            if (isLiteral(v)) { errors.push(`${at}: логический параметр "${n}" принимает только условие-блок`); return; }
            const cid = compileBlock(v, `${at}.args.${n}`, id, 'boolean', opts); if (cid) b.inputs[aid] = [2, cid];
          } else {
            if (v === undefined || isLiteral(v)) b.inputs[aid] = [1, [10, v === undefined ? '' : String(v)]];
            else { const r = compileReporterRef(v, `${at}.args.${n}`, id, opts); if (r) b.inputs[aid] = [3, r, [10, '']]; }
          }
        });
        return id;
      }

      const def = BLOCKS[op];
      if (!def) { errors.push(`${at}: неизвестный блок "${op}". Похожие: ${suggestOpcodes(op).join(', ')}`); return null; }
      if (def.opcode === 'procedures_definition') { errors.push(`${at}: процедуры описываются в "procedures" спрайта, а не блоком procedures_definition`); return null; }
      if (!def.inPalette) warnings.push(`${at}: блока "${op}" нет в палитре Robbo Scratch (он скрытый/экспериментальный) — может не работать`);
      if (isStage && (def.device || def.category === 'motion')) {
        if (def.device) errors.push(`${at}: блоки устройств (${def.device}) нельзя ставить на Сцену — только в спрайт`);
        else if (def.category === 'motion') errors.push(`${at}: блоки "Движение" недоступны на Сцене`);
      }
      // context checks
      const shape = def.shape;
      if (ctxKind === 'stack' && (shape === 'reporter' || shape === 'boolean')) errors.push(`${at}: "${op}" — это значение (${shape === 'boolean' ? 'условие' : 'число/текст'}), его нельзя ставить как команду. Вставьте его в поле другого блока`);
      if ((ctxKind === 'reporter' || ctxKind === 'boolean') && !(shape === 'reporter' || shape === 'boolean')) errors.push(`${at}: "${op}" — это команда, её нельзя вставлять в поле`);
      if (ctxKind === 'boolean' && shape === 'reporter') warnings.push(`${at}: в шестиугольное поле (условие) вставлено круглое значение "${op}" — Scratch это допускает, но обычно нужен блок-условие (сравнение)`);
      if (shape === 'hat' && !opts.first) errors.push(`${at}: "${op}" — это стартовый блок (шапка), он может быть только первым в скрипте`);

      const b = { opcode: op, next: null, parent: parentId, inputs: {}, fields: {}, shadow: false, topLevel: false };
      blocks[id] = b;
      if (def.extension) usedExtensions.add(def.extension);
      const known = new Set(['op', 'opcode', ...def.inputs.map(i => i.name), ...def.fields.map(f => f.name)]);
      for (const k of Object.keys(node)) if (!known.has(k)) errors.push(`${at}: у блока "${op}" нет поля "${k}". Допустимые: ${[...known].filter(x => x !== 'op' && x !== 'opcode').join(', ') || '(нет полей)'}`);

      for (const f of def.fields) {
        let v = node[f.name];
        const fat = `${at}.${f.name}`;
        if (f.kind === 'dropdown') {
          if (v === undefined) v = f.default;
          if (f.options) { const r = resolveOption(f.options, v); if (!r.ok) errors.push(`${fat}: недопустимое значение ${JSON.stringify(v)}. Допустимо: ${f.options.map(o => `"${o.value}" (${o.ru || o.en})`).join(', ')}`); v = r.value; }
          b.fields[f.name] = [String(v), null];
        } else if (f.kind === 'variable' || f.kind === 'list') {
          if (v === undefined) { errors.push(`${fat}: укажите имя ${f.kind === 'list' ? 'списка' : 'переменной'}`); continue; }
          b.fields[f.name] = [String(v), findVar(v, f.kind === 'list' ? 'list' : 'var', fat), ...(f.kind === 'list' ? ['list'] : [])];
        } else if (f.kind === 'broadcast') {
          if (v === undefined) v = 'сообщение1';
          b.fields[f.name] = [String(v), getBroadcast(v)];
        } else {
          b.fields[f.name] = [String(v ?? ''), null];
        }
      }
      for (const inp of def.inputs) {
        const v = node[inp.name];
        const iat = `${at}.${inp.name}`;
        if (inp.kind === 'statement') {
          if (v === undefined || v === null || (Array.isArray(v) && !v.length)) continue;
          if (!Array.isArray(v)) { errors.push(`${iat}: ожидается массив блоков [ ... ]`); continue; }
          const first = compileStack(v, iat, id, opts);
          if (first) b.inputs[inp.name] = [2, first];
          continue;
        }
        if (inp.kind === 'boolean') {
          if (v === undefined || v === null) continue;
          if (isLiteral(v)) { errors.push(`${iat}: сюда нужен блок-условие (например operator_gt, sensing_touchingobject), а не значение ${JSON.stringify(v)}`); continue; }
          const cid = compileBlock(v, iat, id, 'boolean', opts);
          if (cid) b.inputs[inp.name] = [2, cid];
          continue;
        }
        // value input
        if (v === undefined || isLiteral(v)) {
          const sh = shadowFor(inp, v, iat, id);
          if (sh !== null) b.inputs[inp.name] = [1, sh];
        } else if (Array.isArray(v)) {
          errors.push(`${iat}: в поле нельзя положить массив блоков — только одно значение или один блок-значение`);
        } else {
          const r = (v.var !== undefined || v.list !== undefined) && Object.keys(v).length === 1 ? compileReporterRef(v, iat, id) : compileBlock(v, iat, id, 'reporter', opts);
          if (!r) continue;
          const sh = shadowFor(inp, undefined, iat, id);
          b.inputs[inp.name] = sh === null ? [2, r] : [3, r, sh];
        }
      }
      if (op === 'control_stop') {
        const so = b.fields.STOP_OPTION[0];
        b.mutation = { tagName: 'mutation', children: [], hasnext: String(so === 'other scripts in sprite') };
      }
      return id;
    }

    function compileStack(arr, at, parentId, opts = {}, isTop = false) {
      let firstId = null, prevId = null;
      arr.forEach((node, i) => {
        const nat = `${at}[${i}]`;
        const id = compileBlock(node, nat, prevId || parentId, 'stack', { ...opts, first: isTop && i === 0 });
        if (!id) return;
        if (prevId) {
          blocks[prevId].next = id;
          const pdef = BLOCKS[blocks[prevId].opcode];
          if (pdef && (pdef.shape === 'cap' || pdef.shape === 'c_end') && !(blocks[prevId].opcode === 'control_stop' && blocks[prevId].mutation.hasnext === 'true'))
            errors.push(`${nat}: после "${blocks[prevId].opcode}" нельзя ставить блоки (это завершающий блок)`);
        } else firstId = id;
        prevId = id;
      });
      return firstId;
    }

    // scripts
    let y = 30;
    const placeTop = (id, sx, sy, count) => {
      blocks[id].topLevel = true; blocks[id].parent = null;
      blocks[id].x = sx ?? 30; blocks[id].y = sy ?? y;
      y = Math.max(y, blocks[id].y) + 60 + count * 56;
    };
    const countBlocks = arr => (arr || []).reduce((n, b) => n + 1 + (b && typeof b === 'object' ? Object.values(b).filter(Array.isArray).reduce((m, a) => m + countBlocks(a), 0) : 0), 0);

    procSpecs.forEach((p, i) => {
      const proc = procs.get(p.name); if (!proc) return;
      const at = `${where} procedures[${i}] "${p.name}"`;
      const defId = newId(), protoId = newId();
      blocks[defId] = { opcode: 'procedures_definition', next: null, parent: null, inputs: { custom_block: [1, protoId] }, fields: {}, shadow: false, topLevel: true };
      const proto = { opcode: 'procedures_prototype', next: null, parent: defId, inputs: {}, fields: {}, shadow: true, topLevel: false,
        mutation: { tagName: 'mutation', children: [], proccode: proc.proccode, argumentids: JSON.stringify(proc.argIds), argumentnames: JSON.stringify(proc.argNames), argumentdefaults: JSON.stringify(proc.argTypes.map(t => t === 'boolean' ? 'false' : '')), warp: String(proc.warp) } };
      blocks[protoId] = proto;
      proc.argIds.forEach((aid, k) => {
        const rid = newId();
        blocks[rid] = { opcode: proc.argTypes[k] === 'boolean' ? 'argument_reporter_boolean' : 'argument_reporter_string_number', next: null, parent: protoId, inputs: {}, fields: { VALUE: [proc.argNames[k], null] }, shadow: true, topLevel: false };
        proto.inputs[aid] = [1, rid];
      });
      const body = p.body || [];
      if (!Array.isArray(body)) { errors.push(`${at}: "body" должен быть массивом блоков`); return; }
      const first = compileStack(body, `${at}.body`, defId, { proc });
      if (first) blocks[defId].next = first;
      placeTop(defId, 500, undefined, countBlocks(body));
    });

    const scripts = tspec.scripts || [];
    if (!Array.isArray(scripts)) { errors.push(`${where}: "scripts" должен быть массивом скриптов`); return; }
    scripts.forEach((s, i) => {
      const at = `${where} scripts[${i}]`;
      let arr = s, sx, sy;
      if (s && !Array.isArray(s) && typeof s === 'object') {
        if (s.blocks) { arr = s.blocks; sx = s.x; sy = s.y; }
        else arr = [s];
      }
      if (!Array.isArray(arr)) { errors.push(`${at}: скрипт — это массив блоков`); return; }
      if (!arr.length) return;
      const first = compileStack(arr, at, null, {}, true);
      if (!first) return;
      const fdef = BLOCKS[blocks[first].opcode];
      if (fdef && fdef.shape !== 'hat') warnings.push(`${at}: скрипт не начинается со стартового блока (например event_whenflagclicked) — он не запустится сам`);
      placeTop(first, sx, sy, countBlocks(arr));
    });
  }

  const usedExtensions = new Set();

  // stage
  stage.costumes = buildCostumes(stageSpec.backdrops, true, 'Сцена');
  stage.sounds = buildSounds(stageSpec.sounds, true, 'Сцена');
  compileTarget(stage, stageSpec, 'Сцена', null, null);

  const targets = [stage];
  const names = new Set();
  sprites.forEach((sp, i) => {
    const where = `Спрайт "${sp && sp.name || i + 1}"`;
    if (!sp || typeof sp !== 'object') { errors.push(`sprites[${i}] должен быть объектом`); return; }
    for (const k of Object.keys(sp)) if (!SPRITE_KEYS.includes(k)) errors.push(`${where}: неизвестный ключ "${k}". Допустимые: ${SPRITE_KEYS.join(', ')}`);
    const name = sp.name || `Спрайт${i + 1}`;
    if (names.has(name) || name === 'Stage') errors.push(`${where}: имя спрайта повторяется`);
    names.add(name);
    const t = {
      isStage: false, name, variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: sp.currentCostume || 0, costumes: buildCostumes(sp.costumes, false, where), sounds: buildSounds(sp.sounds, false, where),
      volume: sp.volume ?? 100, layerOrder: i + 1, visible: sp.visible ?? true, x: sp.x ?? 0, y: sp.y ?? 0, size: sp.size ?? 100,
      direction: sp.direction ?? 90, draggable: sp.draggable ?? false, rotationStyle: sp.rotationStyle || 'all around',
    };
    const lv = new Map(), ll = new Map();
    for (const [n, v] of Object.entries(sp.variables || {})) addVar(t, lv, n, v);
    for (const [n, v] of Object.entries(sp.lists || {})) addList(t, ll, n, Array.isArray(v) ? v : []);
    compileTarget(t, sp, where, lv, ll);
    targets.push(t);
  });

  const monitors = [];
  for (const m of opts.listMonitors || []) {
    const id = globalLists.get(m.name);
    if (id) monitors.push({ id, mode: 'list', opcode: 'data_listcontents', params: { LIST: m.name }, spriteName: null, value: [], width: m.width || 0, height: m.height || 0, x: m.x ?? 5, y: m.y ?? 5, visible: m.visible !== false });
  }
  const project = {
    targets, monitors, extensions: [...usedExtensions],
    meta: { semver: '3.0.0', vm: '0.1.0', agent: 'robbo-sb3 (AI generator)' },
  };
  return { project, assets, errors, warnings };
}

function buildSb3(spec, opts = {}) {
  const r = compile(spec, opts);
  if (r.errors.length) throw new CompileError(r.errors, r.warnings);
  const files = [{ name: 'project.json', data: JSON.stringify(r.project) }];
  for (const [name, data] of r.assets) files.push({ name, data });
  return { buffer: createZip(files), project: r.project, warnings: r.warnings };
}

module.exports = { compile, buildSb3, CompileError };
