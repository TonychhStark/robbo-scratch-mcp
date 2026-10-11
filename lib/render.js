'use strict';
// Robbo-JSON -> human-readable Russian pseudo-blocks (like the Scratch palette)
const { BLOCKS, resolveOption } = require('./catalog');

function render(spec) {
  const lines = [];
  const fmtVal = (inp, v, proc) => {
    if (v === undefined) v = inp ? inp.default : undefined;
    if (v === undefined || v === null) return inp && inp.kind === 'boolean' ? '< >' : '( )';
    if (typeof v === 'object') return inline(v);
    if (inp && inp.menu && inp.menu.options) { const o = inp.menu.options.find(o => o.value === resolveOption(inp.menu.options, v).value); return `[${o ? (o.ru || o.en || o.value) : v} ▾]`; }
    if (inp && inp.menu) return `[${v} ▾]`;
    if (inp && inp.shadow === 'text') return `[${v}]`;
    return `(${v})`;
  };
  function inline(node) {
    if (!node || typeof node !== 'object') return String(node);
    if (node.var !== undefined) return `(${node.var})`;
    if (node.list !== undefined) return `(${node.list} :список)`;
    if (node.arg !== undefined) return `(${node.arg} :параметр)`;
    const t = text(node);
    const def = BLOCKS[node.op];
    return def && def.shape === 'boolean' ? `<${t}>` : `(${t})`;
  }
  function text(node) {
    if (node.op === 'call' || node.op === 'procedures_call') {
      const args = node.args ? (Array.isArray(node.args) ? node.args : Object.values(node.args)) : [];
      return `${node.proc} ${args.map(a => (typeof a === 'object' ? inline(a) : `(${a})`)).join(' ')}`.trim() + ' :мой блок';
    }
    const def = BLOCKS[node.op];
    if (!def) return `??? ${node.op}`;
    let t = def.ru || def.en || node.op;
    t = t.split(/\{\w+\}/)[0];
    t = t.replace(/\[(\w+)\]/g, (m, name) => {
      const inp = def.inputs.find(i => i.name === name);
      if (inp) return fmtVal(inp, node[name]);
      const f = def.fields.find(f => f.name === name);
      if (f) {
        let v = node[name] ?? f.default;
        if (f.options) { const o = f.options.find(o => o.value === resolveOption(f.options, v).value); v = o ? (o.ru || o.en || o.value) : v; }
        return `[${v} ▾]`;
      }
      return m;
    });
    return t.replace(/\s+/g, ' ').trim();
  }
  function stack(arr, depth) {
    const pad = '    '.repeat(depth);
    for (const node of arr || []) {
      if (!node || typeof node !== 'object') { lines.push(pad + '??? ' + JSON.stringify(node)); continue; }
      const def = BLOCKS[node.op];
      lines.push(pad + text(node));
      if (def) {
        const subs = def.inputs.filter(i => i.kind === 'statement');
        subs.forEach((s, k) => {
          if (k > 0) lines.push(pad + 'иначе');
          stack(node[s.name], depth + 1);
        });
        if (subs.length) lines.push(pad + 'конец');
      }
    }
  }
  const target = (t, title) => {
    lines.push(`==== ${title} ====`);
    for (const p of t.procedures || []) {
      lines.push(`определить ${p.name} ${(p.params || []).map(x => (typeof x === 'string' ? `(${x})` : x.type === 'boolean' ? `<${x.name}>` : `(${x.name})`)).join(' ')}`.trim());
      stack(p.body, 1);
      lines.push('');
    }
    for (const s of t.scripts || []) {
      const arr = Array.isArray(s) ? s : s.blocks || [s];
      stack(arr, 0);
      lines.push('');
    }
  };
  if (spec.stage && (spec.stage.scripts || spec.stage.procedures)) target(spec.stage, 'Сцена');
  const sprites = spec.sprites || (spec.scripts ? [{ name: 'Спрайт1', scripts: spec.scripts, procedures: spec.procedures }] : []);
  for (const s of sprites) target(s, `Спрайт: ${s.name || ''}`);
  return lines.join('\n').trim();
}

module.exports = { render };
