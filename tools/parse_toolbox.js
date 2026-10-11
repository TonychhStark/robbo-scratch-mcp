// Parses Robbo's make-toolbox-xml.js -> toolbox.json (default inputs/shadows for every palette block)
const fs = require('fs');
function parseToolbox(src) {
  const cats = [...src.matchAll(/<category[^>]*\bid="([^"]+)"/g)].map(m => [m.index, m[1]]);
  const catAt = pos => { let c = null; for (const [p, n] of cats) if (p < pos) c = n; return c; };
  const tok = /<(\/?)(block|shadow|value|statement|field|category|xml|label|button|sep)\b([^>]*?)(\/?)>/gs;
  const attr = (s, n) => { const m = s.match(new RegExp(n + '="([^"]*)"')); return m ? m[1] : null; };
  const stack = [], order = [];
  let m;
  while ((m = tok.exec(src))) {
    const [, close, tag, attrs, selfc] = m;
    if (['category', 'xml', 'label', 'button', 'sep'].includes(tag)) continue;
    if (close) {
      while (stack.length) { const n = stack.pop(); if (n.tag === tag) { if (tag === 'field') n.text = src.slice(n.end, m.index).trim(); break; } }
      continue;
    }
    const node = { tag, name: attr(attrs, 'name'), type: attr(attrs, 'type'), kids: [], end: m.index + m[0].length, pos: m.index };
    if (stack.length) stack[stack.length - 1].kids.push(node); else if (tag === 'block') order.push(node);
    if (!selfc) stack.push(node);
  }
  const conv = b => {
    const r = { type: b.type, shadow: b.tag === 'shadow', inputs: {}, fields: {} };
    for (const k of b.kids) {
      if (k.tag === 'value' || k.tag === 'statement') {
        const ins = {};
        for (const kk of k.kids) { if (kk.tag === 'shadow') ins.shadow = conv(kk); else if (kk.tag === 'block') ins.block = conv(kk); }
        r.inputs[k.name] = ins;
      } else if (k.tag === 'field') r.fields[k.name] = k.text || '';
    }
    return r;
  };
  const out = {};
  for (const b of order) { if (out[b.type]) continue; const d = conv(b); d.category = catAt(b.pos); out[b.type] = d; }
  return out;
}
module.exports = { parseToolbox };
if (require.main === module) {
  const out = parseToolbox(fs.readFileSync(process.argv[2], 'utf8'));
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  console.log(Object.keys(out).length);
}
