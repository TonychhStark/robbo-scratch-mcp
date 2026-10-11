// Self-test: every example compiles, decompiles back to the same program, and every catalog block compiles.
const fs = require('fs'), path = require('path');
const { buildSb3, compile } = require('../lib/compiler');
const { decompile } = require('../lib/decompiler');
const { BLOCKS } = require('../lib/catalog');
let fail = 0;
const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) fail++; };
const exDir = path.join(__dirname, '..', 'examples');
for (const f of fs.readdirSync(exDir).filter(f => f.endsWith('.json'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(exDir, f), 'utf8'));
  try {
    const r = buildSb3(spec, { baseDir: exDir });
    const back = decompile(r.buffer).spec;
    const again = decompile(buildSb3(back, { baseDir: exDir }).buffer).spec;
    ok(JSON.stringify(back) === JSON.stringify(again), `${f}: собирается и стабильно читается обратно`);
  } catch (e) { ok(false, `${f}: ${e.message}`); }
}
// every block with default values
const scripts = []; const cur = [{ op: 'event_whenflagclicked' }];
for (const b of Object.values(BLOCKS)) {
  const n = { op: b.opcode };
  for (const f of b.fields) if (f.kind === 'variable') n[f.name] = 'x'; else if (f.kind === 'list') n[f.name] = 'L';
  for (const i of b.inputs) if (i.kind === 'boolean') n[i.name] = { op: 'operator_gt', OPERAND1: 1, OPERAND2: 2 };
  if (b.shape === 'hat') scripts.push([n]);
  else if (b.shape === 'reporter' || b.shape === 'boolean') cur.push({ op: 'looks_say', MESSAGE: n });
  else if (b.shape === 'cap' || b.shape === 'c_end') scripts.push([{ op: 'event_whenflagclicked' }, n]);
  else cur.push(n);
}
scripts.push(cur);
const r = compile({ variables: { x: 0 }, lists: { L: [] }, sprites: [{ name: 'Спрайт1', scripts }] });
ok(!r.errors.length, `все ${Object.keys(BLOCKS).length} блоков каталога компилируются` + (r.errors.length ? ': ' + r.errors.slice(0, 3).join('; ') : ''));
// error detection
const bad = compile({ scripts: [[{ op: 'event_whenflagclicked' }, { op: 'nope_block' }, { op: 'robot_set_direction_to', ROBOT_DIRECTION: 'вверх' }]] });
ok(bad.errors.length === 2, 'ошибки находятся (неизвестный блок, неверное значение списка)');
process.exit(fail ? 1 : 0);
