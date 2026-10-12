'use strict';
// Debug mode: instrument a robbo-json program so that, while it runs in Robbo Scratch,
// it writes a human-readable log into the global list "лог":
//   [12:40:15] Датчик1 = 12 (Датчик1 < 50) поэтому Повернуть ↻ на 45 градусов
// In endless loops (forever / repeat until) a loop pass is written only when the path
// through the program changed (other branch, other actions) or once per `interval` seconds,
// so the log does not get flooded with thousands of identical lines.
const { BLOCKS, resolveOption } = require('./catalog');

const LOG_LIST = 'лог';
const DEVICE_CATEGORIES = new Set(['robot', 'laboratory', 'quadcopter', 'otto', 'newcat', 'iotblocks']);
const LOGGED_OPS = new Set(['control_wait', 'control_wait_until']);
const UNBOUNDED_LOOPS = new Set(['control_forever', 'control_repeat_until']);
const BRANCHES = new Set(['control_if', 'control_if_else']);
const CMP = { operator_lt: '<', operator_gt: '>', operator_equals: '=' };

// generated names (per-sprite variables/lists and procedures)
const V = { reason: '_причина', line: '_строка', sig: '_подпись', prevSig: '_прошлая_подпись', depth: '_глубина', flushed: '_сброшено', h: '_ч', m: '_м', s: '_с', i: '_i' };
const BUF = '_буфер';
const START = '_лог_старт';
const P = { log: 'лог', write: 'лог запись', start: 'лог старт', loopBegin: 'лог цикл начало', loopEnd: 'лог цикл конец' };
const GENERATED_PROCS = new Set(Object.values(P));

const clone = x => JSON.parse(JSON.stringify(x));
const isNode = v => v && typeof v === 'object' && !Array.isArray(v);

// ---- tiny builders ----
const join = parts => {
  const p = parts.filter(x => x !== '' && x !== undefined && x !== null);
  if (!p.length) return '';
  return p.reduceRight((acc, x) => (acc === null ? x : { op: 'operator_join', STRING1: x, STRING2: acc }), null);
};
const v = name => ({ var: name });
const set = (name, value) => ({ op: 'data_setvariableto', VARIABLE: name, VALUE: value });
const change = (name, value) => ({ op: 'data_changevariableby', VARIABLE: name, VALUE: value });
const eq = (a, b) => ({ op: 'operator_equals', OPERAND1: a, OPERAND2: b });
const not = c => ({ op: 'operator_not', OPERAND: c });
const iff = (c, then, otherwise) => (otherwise ? { op: 'control_if_else', CONDITION: c, SUBSTACK: then, SUBSTACK2: otherwise } : { op: 'control_if', CONDITION: c, SUBSTACK: then });
const call = (proc, args) => ({ op: 'call', proc, args });
const nowSec = () => ({ op: 'operator_multiply', NUM1: { op: 'sensing_dayssince2000' }, NUM2: 86400 });
const pad2 = (name, part) => [set(name, { op: 'sensing_current', CURRENTMENU: part }), iff({ op: 'operator_lt', OPERAND1: v(name), OPERAND2: 10 }, [set(name, join(['0', v(name)]))])];

// ---- human-readable labels ----
function optionLabel(options, value) {
  if (!options) return String(value);
  const r = resolveOption(options, value);
  const o = options.find(o => o.value === r.value);
  return o ? (o.ru || o.en || o.value) : String(value);
}

function staticText(node) {
  if (!isNode(node)) return node === undefined || node === null ? '' : String(node);
  if (node.var !== undefined) return String(node.var);
  if (node.list !== undefined) return String(node.list);
  if (node.arg !== undefined) return String(node.arg);
  if (CMP[node.op]) return `${staticText(node.OPERAND1)} ${CMP[node.op]} ${staticText(node.OPERAND2)}`;
  if (node.op === 'operator_and') return `${staticText(node.OPERAND1)} и ${staticText(node.OPERAND2)}`;
  if (node.op === 'operator_or') return `${staticText(node.OPERAND1)} или ${staticText(node.OPERAND2)}`;
  if (node.op === 'operator_not') return `не (${staticText(node.OPERAND)})`;
  return label(node);
}

// Label of a block with its static values filled in, e.g. "Датчик1", "вход A1", "Повернуть ↻ на 45 градусов".
function template(node) {
  const def = BLOCKS[node.op];
  if (!def) return [String(node.op)];
  let t = (def.ru || def.en || node.op).split(/\{\w+\}/)[0].replace(/\s+/g, ' ').trim();
  const parts = [];
  let last = 0;
  t.replace(/\[(\w+)\]/g, (m, name, idx) => {
    parts.push(t.slice(last, idx));
    last = idx + m.length;
    const inp = def.inputs.find(i => i.name === name);
    const f = def.fields.find(f => f.name === name);
    let val = node[name];
    if (inp) {
      if (val === undefined) val = inp.default;
      if (isNode(val)) parts.push(val); // live value
      else parts.push(inp.menu && inp.menu.options && !inp.menu.dynamic ? optionLabel(inp.menu.options, val) : String(val ?? ''));
    } else if (f) {
      if (val === undefined) val = f.default;
      parts.push(f.options ? optionLabel(f.options, val) : String(val ?? ''));
    } else parts.push(m);
    return m;
  });
  parts.push(t.slice(last));
  return parts;
}
const tidy = s => s.replace(/на ↻ на/g, 'направо на').replace(/↻/g, 'направо').replace(/↺/g, 'налево').replace(/\s+/g, ' ');
function label(node) {
  const s = template(node).map(p => (isNode(p) ? staticText(p) : p)).join('');
  return tidy(s).replace(/^(Робот|Лаборатория)\s+/, '').trim();
}
// Action text with live values for computed inputs.
function actionText(node) {
  // merge neighbouring static parts so the log text stays one readable string where possible
  const parts = [];
  for (const p of template(node)) {
    if (isNode(p)) parts.push(clone(p));
    else if (typeof parts[parts.length - 1] === 'string') parts[parts.length - 1] += p;
    else parts.push(String(p));
  }
  const out = parts.map(p => (typeof p === 'string' ? tidy(p) : p));
  if (typeof out[0] === 'string') out[0] = out[0].trimStart();
  if (typeof out[out.length - 1] === 'string') out[out.length - 1] = out[out.length - 1].trimEnd();
  return join(out);
}

// Sensors / variables a condition looks at, so their live values can be logged.
function collectReporters(node, out) {
  if (!isNode(node)) return out;
  if (node.var !== undefined || node.arg !== undefined) { out.push(node); return out; }
  if (node.list !== undefined) return out;
  const def = BLOCKS[node.op];
  if (!def) return out;
  if (def.category === 'operators') {
    for (const i of def.inputs) collectReporters(node[i.name], out);
    return out;
  }
  if (def.shape === 'reporter' || def.shape === 'boolean') out.push(node);
  return out;
}
function reasonExpr(cond, positive) {
  const seen = new Set();
  const reps = collectReporters(cond, []).filter(r => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; });
  const values = [];
  reps.forEach((r, i) => { if (i) values.push(', '); values.push(`${staticText(r)} = `, clone(r)); });
  const st = isNode(cond) ? staticText(cond) : String(cond);
  const condIsReporter = reps.length === 1 && JSON.stringify(reps[0]) === JSON.stringify(cond);
  if (!reps.length) return positive ? st : `не (${st})`;
  if (condIsReporter) return join(values);
  // simple comparison "sensor < 50": Датчик1 = 47 (< 50) / Датчик1 = 88 (≥ 50)
  if (reps.length === 1 && CMP[cond.op]) {
    const left = JSON.stringify(cond.OPERAND1) === JSON.stringify(reps[0]);
    const other = left ? cond.OPERAND2 : cond.OPERAND1;
    if (!isNode(other)) {
      const opMap = left ? { '<': '<', '>': '>', '=': '=' } : { '<': '>', '>': '<', '=': '=' };
      const neg = { '<': '≥', '>': '≤', '=': '≠' };
      const o = opMap[CMP[cond.op]];
      return join([...values, ` (${positive ? o : neg[o]} ${other})`]);
    }
  }
  return join([...values, positive ? ` (${st})` : ` (не ${st})`]);
}

// ---- generated helper procedures for one sprite ----
function helperProcedures(interval) {
  const now = nowSec();
  return [
    { name: P.write, warp: true, params: [{ name: 'строка', type: 'number' }], body: [
      iff({ op: 'operator_gt', OPERAND1: { op: 'data_lengthoflist', LIST: LOG_LIST }, OPERAND2: 4999 }, [{ op: 'data_deleteoflist', INDEX: 1, LIST: LOG_LIST }]),
      { op: 'data_addtolist', ITEM: { arg: 'строка' }, LIST: LOG_LIST },
    ] },
    { name: P.log, warp: true, params: [{ name: 'ключ', type: 'number' }, { name: 'текст', type: 'number' }], body: [
      set(V.line, { arg: 'текст' }),
      iff(not(eq(v(V.reason), '')), [set(V.line, join([v(V.reason), ' поэтому ', v(V.line)])), set(V.reason, '')]),
      ...pad2(V.h, 'HOUR'), ...pad2(V.m, 'MINUTE'), ...pad2(V.s, 'SECOND'),
      set(V.line, join(['[', v(V.h), ':', v(V.m), ':', v(V.s), '] ', v(V.line)])),
      iff({ op: 'operator_gt', OPERAND1: v(V.depth), OPERAND2: 0 },
        [iff({ op: 'operator_lt', OPERAND1: { op: 'data_lengthoflist', LIST: BUF }, OPERAND2: 200 }, [{ op: 'data_addtolist', ITEM: v(V.line), LIST: BUF }]),
          set(V.sig, join([v(V.sig), ',', { arg: 'ключ' }]))],
        [call(P.write, { 'строка': v(V.line) })]),
    ] },
    { name: P.loopBegin, warp: true, params: [], body: [
      iff({ op: 'operator_lt', OPERAND1: v(V.depth), OPERAND2: 0 }, [set(V.depth, 0)]),
      change(V.depth, 1),
      iff(eq(v(V.depth), 1), [{ op: 'data_deletealloflist', LIST: BUF }, set(V.sig, '')]),
    ] },
    { name: P.loopEnd, warp: true, params: [{ name: 'всегда', type: 'number' }], body: [
      iff({ op: 'operator_or', OPERAND1: eq(v(V.depth), 1), OPERAND2: eq({ arg: 'всегда' }, 1) }, [
        iff({ op: 'operator_and',
          OPERAND1: { op: 'operator_gt', OPERAND1: { op: 'data_lengthoflist', LIST: BUF }, OPERAND2: 0 },
          OPERAND2: { op: 'operator_or',
            OPERAND1: { op: 'operator_or', OPERAND1: not(eq(v(V.sig), v(V.prevSig))), OPERAND2: eq({ arg: 'всегда' }, 1) },
            OPERAND2: { op: 'operator_gt', OPERAND1: { op: 'operator_subtract', NUM1: now, NUM2: v(V.flushed) }, OPERAND2: interval } } }, [
          set(V.i, 1),
          { op: 'control_repeat', TIMES: { op: 'data_lengthoflist', LIST: BUF }, SUBSTACK: [
            call(P.write, { 'строка': { op: 'data_itemoflist', INDEX: v(V.i), LIST: BUF } }), change(V.i, 1)] },
          set(V.prevSig, v(V.sig)), set(V.flushed, clone(now)),
        ]),
        { op: 'data_deletealloflist', LIST: BUF }, set(V.sig, ''),
      ]),
      iff(eq({ arg: 'всегда' }, 1), [set(V.depth, 0)], [change(V.depth, -1)]),
    ] },
    { name: P.start, warp: true, params: [{ name: 'кто', type: 'number' }], body: [
      iff({ op: 'operator_gt', OPERAND1: { op: 'operator_subtract', NUM1: clone(now), NUM2: v(START) }, OPERAND2: 1 },
        [{ op: 'data_deletealloflist', LIST: LOG_LIST }, set(START, clone(now))]),
      set(V.depth, 0), set(V.reason, ''), set(V.prevSig, ''), set(V.flushed, 0), { op: 'data_deletealloflist', LIST: BUF },
      call(P.log, { 'ключ': 'start', 'текст': join(['▶ Старт (', { arg: 'кто' }, ')']) }),
    ] },
  ];
}

/**
 * Returns a new robbo-json program with logging blocks inserted.
 * opts.interval — seconds between repeated identical loop passes in the log (default 1).
 */
function instrument(spec, opts = {}) {
  const interval = Number(opts.interval ?? (isNode(spec.debug) && spec.debug.interval) ?? 1) || 1;
  const out = clone(spec);
  delete out.debug;
  let sprites = out.sprites;
  if (!sprites && (out.scripts || out.procedures)) {
    sprites = [{ name: 'Спрайт1', scripts: out.scripts, procedures: out.procedures }];
    delete out.scripts; delete out.procedures;
  }
  out.sprites = sprites || [];
  out.lists = { ...(out.lists || {}), [LOG_LIST]: [] };
  out.variables = { ...(out.variables || {}), [START]: 0 };
  let stats = { logPoints: 0, branches: 0, loops: 0 };

  out.sprites.forEach((sp, si) => {
    if (!sp || typeof sp !== 'object') return;
    const spriteName = sp.name || `Спрайт${si + 1}`;
    for (const p of sp.procedures || []) if (GENERATED_PROCS.has(p.name)) throw new Error(`Спрайт "${spriteName}": имя процедуры "${p.name}" занято режимом отладки — переименуйте её`);
    let n = 0;
    const key = () => `${si}.${++n}`;
    const logCall = text => { stats.logPoints++; return call(P.log, { 'ключ': key(), 'текст': text }); };

    function inst(arr, ctx) {
      const res = [];
      for (const node of Array.isArray(arr) ? arr : []) {
        if (!isNode(node) || !node.op) { res.push(node); continue; }
        const def = BLOCKS[node.op];
        if (!def) { res.push(node); continue; }
        if (BRANCHES.has(node.op)) {
          stats.branches++;
          const outer = ctx.reason;
          const both = (inner) => (outer ? join([clone(outer), ' и ', inner]) : inner);
          const pos = both(reasonExpr(node.CONDITION, true)), neg = both(reasonExpr(node.CONDITION, false));
          const restore = set(V.reason, outer ? clone(outer) : '');
          const nn = { ...node, SUBSTACK: [set(V.reason, pos), ...inst(node.SUBSTACK, { ...ctx, reason: pos }), restore] };
          if (node.op === 'control_if_else') nn.SUBSTACK2 = [set(V.reason, neg), ...inst(node.SUBSTACK2, { ...ctx, reason: neg }), clone(restore)];
          res.push(nn);
          continue;
        }
        if (UNBOUNDED_LOOPS.has(node.op)) {
          stats.loops++;
          res.push({ ...node, SUBSTACK: [call(P.loopBegin, {}), ...inst(node.SUBSTACK, { ...ctx, inLoop: true }), call(P.loopEnd, { 'всегда': 0 })] });
          if (node.op === 'control_repeat_until') res.push(set(V.reason, join(['цикл закончился: ', reasonExpr(node.CONDITION, true)])));
          continue;
        }
        if (node.op === 'control_stop') {
          const opt = String(node.STOP_OPTION ?? 'all');
          if (/all|this script|все|этот скрипт/i.test(opt)) { res.push(call(P.loopEnd, { 'всегда': 1 }), logCall(`■ ${label(node)}`)); }
          res.push(node);
          continue;
        }
        if (node.op === 'control_wait_until') {
          if (ctx.inLoop) { res.push(node); continue; }
          res.push(logCall(`Ждать до: ${staticText(node.CONDITION)}`), node, set(V.reason, join(['дождались: ', reasonExpr(node.CONDITION, true)])));
          continue;
        }
        const statements = def.inputs.filter(i => i.kind === 'statement');
        const nn = statements.length ? { ...node } : node;
        for (const s of statements) nn[s.name] = inst(node[s.name], ctx);
        if (def.shape === 'stack' && (DEVICE_CATEGORIES.has(def.category) || (LOGGED_OPS.has(node.op) && !ctx.inLoop))) res.push(logCall(actionText(node)));
        res.push(nn);
      }
      return res;
    }

    sp.scripts = (sp.scripts || []).map(s => {
      const arr = Array.isArray(s) ? s : (s && s.blocks) || [s];
      if (!arr.length) return arr;
      const hat = arr[0], hdef = hat && BLOCKS[hat.op];
      if (!hdef || hdef.shape !== 'hat') return arr; // loose blocks: leave as is
      const head = hat.op === 'event_whenflagclicked' ? call(P.start, { 'кто': spriteName }) : logCall(`▶ ${label(hat)} (${spriteName})`);
      const body = inst(arr.slice(1), { reason: null });
      const lastDef = arr.length > 1 && BLOCKS[arr[arr.length - 1].op];
      const tail = lastDef && (lastDef.shape === 'c_end' || lastDef.shape === 'cap') ? [] : [logCall(`■ Конец скрипта (${spriteName})`)];
      return [hat, head, ...body, ...tail];
    });
    sp.procedures = [...(sp.procedures || []).map(p => ({ ...p, body: inst(p.body, { reason: null }) })), ...helperProcedures(interval)];
    sp.variables = { ...(sp.variables || {}), [V.reason]: '', [V.line]: '', [V.sig]: '', [V.prevSig]: '', [V.depth]: 0, [V.flushed]: 0, [V.h]: 0, [V.m]: 0, [V.s]: 0, [V.i]: 0 };
    sp.lists = { ...(sp.lists || {}), [BUF]: [] };
  });
  return { spec: out, stats };
}

// ---- reading a log back ----
function extractLog(project) {
  for (const t of project.targets || []) {
    for (const l of Object.values(t.lists || {})) if (l[0] === LOG_LIST) return l[1].map(String);
  }
  return null;
}

function analyzeLog(lines) {
  const sensors = new Map(), actions = new Map();
  const times = [];
  for (const line of lines) {
    const tm = line.match(/^\[(\d\d):(\d\d):(\d\d)\]\s*(.*)$/);
    if (tm) times.push(+tm[1] * 3600 + +tm[2] * 60 + +tm[3]);
    const body = tm ? tm[4] : line;
    const [cause, action] = body.includes(' поэтому ') ? body.split(' поэтому ') : ['', body];
    for (const m of cause.matchAll(/([^,()=:]+?) = (-?\d+(?:[.,]\d+)?)/g)) {
      const name = m[1].replace(/^.*(?:дождались|закончился|\bи)\s+/, '').trim(), val = parseFloat(m[2].replace(',', '.'));
      const s = sensors.get(name) || { n: 0, min: Infinity, max: -Infinity, sum: 0 };
      s.n++; s.min = Math.min(s.min, val); s.max = Math.max(s.max, val); s.sum += val; sensors.set(name, s);
    }
    const a = action.replace(/\(.*\)$/, '').trim();
    if (a) actions.set(a, (actions.get(a) || 0) + 1);
  }
  let duration = null;
  if (times.length > 1) { let d = times[times.length - 1] - times[0]; if (d < 0) d += 86400; duration = d; }
  return { sensors, actions, duration };
}

module.exports = { instrument, extractLog, analyzeLog, LOG_LIST };
