'use strict';
// .sb3 / project.json -> Robbo-JSON (the same simple format the compiler accepts)
const fs = require('fs');
const path = require('path');
const { BLOCKS } = require('./catalog');
const { readZip } = require('./zip');

const DEFAULT_ASSETS = new Set(['f8e72b8244738d0b448e46b38c5db6c2', 'bb3a866c4db08353f6faf43c54990f10', 'bb6b82c9fa7c432c552ca2f251ae2078', 'be2345a4417ff516f9c1a5ece86a8c64', 'cd21514d0531fdffb22204e0ec5ed84a']);
const DEFAULT_SOUNDS = new Set(['83a9787d4cb6f3b7632b4ddfebf74367', '28c76b6bebd04be1383fe9ba4933d263']);
const NUMERIC_PRIMS = new Set([4, 5, 6, 7, 8]);
const PRIM_BY_OPCODE = { math_number: 4, math_positive_number: 5, math_whole_number: 6, math_integer: 7, math_angle: 8, colour_picker: 9, text: 10 };

const toNum = v => (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : v);

function loadProject(input) {
  if (Buffer.isBuffer(input)) {
    if (input[0] === 0x7b) return { project: JSON.parse(input.toString('utf8')), files: {} };
    const files = readZip(input);
    if (!files['project.json']) throw new Error('В архиве нет project.json — это не .sb3');
    return { project: JSON.parse(files['project.json'].toString('utf8')), files };
  }
  if (typeof input === 'string') return loadProject(fs.readFileSync(input));
  return { project: input, files: {} };
}

function decompile(input, opts = {}) {
  const { project, files } = loadProject(input);
  const warnings = [];
  const stageT = project.targets.find(t => t.isStage);
  const spec = {};
  const varsOf = t => Object.entries(t.variables || {});
  if (stageT && varsOf(stageT).length) spec.variables = Object.fromEntries(varsOf(stageT).map(([, v]) => [v[0], v[1]]));
  if (stageT && Object.keys(stageT.lists || {}).length) spec.lists = Object.fromEntries(Object.values(stageT.lists).map(v => [v[0], v[1]]));
  if (stageT && Object.keys(stageT.broadcasts || {}).length) spec.broadcasts = Object.values(stageT.broadcasts);

  const assetOut = opts.assetsDir;
  function exportAsset(a, where) {
    if (!assetOut) return null;
    const data = files[a.md5ext || `${a.assetId}.${a.dataFormat}`];
    if (!data) { warnings.push(`${where}: в архиве нет файла ${a.md5ext}`); return null; }
    fs.mkdirSync(assetOut, { recursive: true });
    const safe = String(a.name).replace(/[\\/:*?"<>|]/g, '_');
    const fname = `${safe}.${a.dataFormat}`;
    fs.writeFileSync(path.join(assetOut, fname), data);
    return path.relative(opts.baseDir || process.cwd(), path.join(assetOut, fname)).split(path.sep).join('/');
  }

  function decompileTarget(t) {
    const blocks = t.blocks || {};
    const out = { scripts: [] };
    const procByProccode = {};
    const getB = id => blocks[id];

    // procedure prototypes
    for (const [id, b] of Object.entries(blocks)) {
      if (b.opcode !== 'procedures_definition') continue;
      const protoRef = b.inputs.custom_block && b.inputs.custom_block[1];
      const proto = getB(protoRef);
      if (!proto || !proto.mutation) continue;
      const m = proto.mutation;
      const proccode = m.proccode;
      const argNames = JSON.parse(m.argumentnames || '[]'), argIds = JSON.parse(m.argumentids || '[]');
      const types = (proccode.match(/%[sbn]/g) || []).map(x => (x === '%b' ? 'boolean' : 'number'));
      const name = proccode.replace(/%[sbn]/g, '').replace(/\s+/g, ' ').trim();
      procByProccode[proccode] = { name, argNames, argIds, proccode, defId: id, warp: m.warp === 'true' || m.warp === true, types };
    }

    function value(ref, at) {
      if (ref === null || ref === undefined) return undefined;
      if (Array.isArray(ref)) {
        const [kind, v, vid] = ref;
        if (kind === 11) return String(v);
        if (kind === 12) return { var: v };
        if (kind === 13) return { list: v };
        return NUMERIC_PRIMS.has(kind) ? toNum(v) : v;
      }
      const b = getB(ref);
      if (!b) return undefined;
      if (b.shadow) {
        if (PRIM_BY_OPCODE[b.opcode] !== undefined) { const f = Object.values(b.fields)[0]; const v = Array.isArray(f) ? f[0] : f && f.value; return NUMERIC_PRIMS.has(PRIM_BY_OPCODE[b.opcode]) ? toNum(v) : v; }
        const f = Object.values(b.fields || {})[0];
        if (f) return Array.isArray(f) ? f[0] : f.value;
        return undefined;
      }
      return block(ref, at);
    }

    function block(id, at) {
      const b = getB(id);
      if (!b) return null;
      const field = n => { const f = b.fields[n]; return Array.isArray(f) ? f[0] : f && f.value; };
      if (b.opcode === 'argument_reporter_string_number' || b.opcode === 'argument_reporter_boolean') return { arg: field('VALUE') };
      if (b.opcode === 'data_variable') return { var: field('VARIABLE') };
      if (b.opcode === 'data_listcontents') return { list: field('LIST') };
      if (b.opcode === 'procedures_call') {
        const p = procByProccode[b.mutation && b.mutation.proccode];
        const callIds = JSON.parse((b.mutation && b.mutation.argumentids) || '[]');
        if (!p) { warnings.push(`${at}: вызов неизвестной процедуры ${b.mutation && b.mutation.proccode}`); return { op: 'call', proc: (b.mutation && b.mutation.proccode) || '?' }; }
        const args = {};
        callIds.forEach(aid => {
          const k = p.argIds.indexOf(aid);
          const inp = b.inputs[aid];
          if (k < 0 || !inp) return;
          const v = inp[0] === 1 ? value(inp[1], at) : value(inp[1], at);
          if (v !== undefined && v !== '') args[p.argNames[k]] = v;
        });
        const r = { op: 'call', proc: p.name };
        if (Object.keys(args).length) r.args = args;
        return r;
      }
      const def = BLOCKS[b.opcode];
      if (!def) warnings.push(`${at}: блок "${b.opcode}" отсутствует в каталоге — оставлен как есть`);
      const r = { op: b.opcode };
      for (const [n, f] of Object.entries(b.fields || {})) r[n] = Array.isArray(f) ? f[0] : f.value;
      for (const [n, inp] of Object.entries(b.inputs || {})) {
        const idef = def && def.inputs.find(i => i.name === n);
        if (idef && idef.kind === 'statement' || (!idef && getB(inp[1]) && !Array.isArray(inp[1]) && getB(inp[1]).previousStatement !== undefined)) {
          const s = stack(inp[1], `${at}.${n}`); if (s.length) r[n] = s; continue;
        }
        if (inp[0] === 2 && typeof inp[1] === 'string' && idef && idef.kind === 'statement') continue;
        const v = value(inp[1], `${at}.${n}`);
        if (v !== undefined && v !== null) r[n] = v;
      }
      return r;
    }

    function stack(firstId, at) {
      const arr = [];
      let id = firstId, i = 0;
      while (id) { const b = getB(id); if (!b) break; arr.push(block(id, `${at}[${i++}]`)); id = b.next; }
      return arr;
    }

    // procedures
    const procs = Object.values(procByProccode);
    if (procs.length) out.procedures = procs.map(p => {
      const r = { name: p.name };
      if (p.argNames.length) r.params = p.argNames.map((n, k) => ({ name: n, type: p.types[k] || 'number' }));
      if (p.warp) r.warp = true;
      const body = stack(blocks[p.defId].next, `procedure "${p.name}"`);
      r.body = body;
      return r;
    });
    // scripts (top-level)
    const tops = Object.entries(blocks).filter(([, b]) => b && !Array.isArray(b) && b.topLevel && !b.shadow && b.opcode !== 'procedures_definition')
      .sort((a, b) => (a[1].y || 0) - (b[1].y || 0) || (a[1].x || 0) - (b[1].x || 0));
    for (const [id, b] of tops) {
      const def = BLOCKS[b.opcode];
      if (def && (def.shape === 'reporter' || def.shape === 'boolean')) { warnings.push(`${t.name}: пропущен отдельно лежащий блок-значение ${b.opcode}`); continue; }
      out.scripts.push(stack(id, `${t.name} script`));
    }
    // top-level compressed variable reporters lying around are ignored
    return out;
  }

  const stageD = decompileTarget(stageT);
  const stageCostumes = stageT.costumes || [];
  if (stageD.scripts.length || stageD.procedures || (assetOut && stageCostumes.some(c => !DEFAULT_ASSETS.has(c.assetId)))) {
    spec.stage = {};
    if (stageD.scripts.length) spec.stage.scripts = stageD.scripts;
    if (stageD.procedures) spec.stage.procedures = stageD.procedures;
    if (assetOut && stageCostumes.some(c => !DEFAULT_ASSETS.has(c.assetId))) spec.stage.backdrops = stageCostumes.map(c => ({ name: c.name, file: exportAsset(c, 'Сцена') })).filter(c => c.file);
  }
  spec.sprites = project.targets.filter(t => !t.isStage).sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0)).map(t => {
    const d = decompileTarget(t);
    const s = { name: t.name };
    for (const k of ['x', 'y', 'size', 'direction']) if (t[k] !== undefined && t[k] !== { x: 0, y: 0, size: 100, direction: 90 }[k]) s[k] = Math.round(t[k] * 100) / 100;
    if (t.visible === false) s.visible = false;
    if (t.rotationStyle && t.rotationStyle !== 'all around') s.rotationStyle = t.rotationStyle;
    if (t.draggable) s.draggable = true;
    if (t.currentCostume) s.currentCostume = t.currentCostume;
    const costumes = t.costumes || [];
    if (assetOut && costumes.some(c => !DEFAULT_ASSETS.has(c.assetId))) s.costumes = costumes.map(c => ({ name: c.name, file: exportAsset(c, t.name), rotationCenterX: c.rotationCenterX, rotationCenterY: c.rotationCenterY })).filter(c => c.file);
    const sounds = t.sounds || [];
    if (assetOut && sounds.some(c => !DEFAULT_SOUNDS.has(c.assetId))) s.sounds = sounds.filter(c => c.dataFormat === 'wav').map(c => ({ name: c.name, file: exportAsset(c, t.name) })).filter(c => c.file);
    if (Object.keys(t.variables || {}).length) s.variables = Object.fromEntries(Object.values(t.variables).map(v => [v[0], v[1]]));
    if (Object.keys(t.lists || {}).length) s.lists = Object.fromEntries(Object.values(t.lists).map(v => [v[0], v[1]]));
    if (d.procedures) s.procedures = d.procedures;
    s.scripts = d.scripts;
    return s;
  });
  if (!assetOut && project.targets.some(t => (t.costumes || []).concat(t.sounds || []).some(a => !DEFAULT_ASSETS.has(a.assetId) && !DEFAULT_SOUNDS.has(a.assetId))))
    warnings.push('В проекте есть свои костюмы/звуки — они не выгружены (укажите assetsDir). При пересборке будут стандартные.');
  return { spec, warnings };
}

module.exports = { decompile, loadProject };
