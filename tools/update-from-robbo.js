#!/usr/bin/env node
// Re-extract the block catalog from an installed Robbo Scratch 3 (e.g. after an update).
// Usage: node tools/update-from-robbo.js "C:\Program Files\Robboscratch3"
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const root = process.argv[2];
if (!root) { console.log('Укажите папку Robbo Scratch 3, где лежит package.nw'); process.exit(1); }
const mapFile = path.join(root, 'package.nw', 'build', 'lib.min.js.map');
if (!fs.existsSync(mapFile)) { console.log('Не найден ' + mapFile); process.exit(1); }
console.log('Читаю source map…');
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'robbo-'));
const want = [/scratch-blocks\/blocks_compressed_vertical\.js$/, /scratch-blocks\/msg\/messages\.js$/, /scratch-blocks\/msg\/scratch_msgs\.js$/, /src\/lib\/make-toolbox-xml\.js$/, /scratch-vm\/src\/blocks\/scratch3_[a-z]+\.js$/];
map.sources.forEach((s, i) => {
  if (!want.some(r => r.test(s)) || /node_modules\/.*node_modules/.test(s.replace('webpack://GUI/./node_modules/', ''))) return;
  const rel = s.replace(/^webpack:\/\/[^/]*\/\.\//, '');
  const p = path.join(tmp, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, map.sourcesContent[i] || '');
});
const sb = path.join(tmp, 'node_modules', 'scratch-blocks');
cp.execFileSync(process.execPath, [path.join(__dirname, 'extract_blocks.js'), sb, path.join(__dirname, 'raw_blocks.json')], { stdio: 'inherit' });
require('./parse_toolbox.js');
const { parseToolbox } = require('./parse_toolbox.js');
fs.writeFileSync(path.join(__dirname, 'toolbox.json'), JSON.stringify(parseToolbox(fs.readFileSync(path.join(tmp, 'src', 'lib', 'make-toolbox-xml.js'), 'utf8')), null, 1));
const prims = {};
for (const [dev, f] of [['robot', 'robot'], ['laboratory', 'laboratory'], ['quadcopter', 'quadcopter'], ['otto', 'otto'], ['arduino', 'newcat'], ['iot', 'iot']]) {
  const file = path.join(tmp, 'node_modules', 'scratch-vm', 'src', 'blocks', `scratch3_${f}.js`);
  if (!fs.existsSync(file)) continue;
  const s = fs.readFileSync(file, 'utf8');
  const m = s.match(/getPrimitives\s*\(\)\s*\{[\s\S]*?return\s*\{([\s\S]*?)\};/), h = s.match(/getHats\s*\(\)\s*\{[\s\S]*?return\s*\{([\s\S]*?)\};\s*\}/);
  prims[dev] = [...((m ? m[1] : '') + (h ? h[1] : '')).matchAll(/^\s*([a-zA-Z_0-9]+)\s*:/mg)].map(x => x[1]).filter(x => x !== 'restartExistingThreads');
}
fs.writeFileSync(path.join(__dirname, 'prims.json'), JSON.stringify(prims));
cp.execFileSync(process.execPath, [path.join(__dirname, 'build_catalog.js')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(__dirname, 'gen_docs.js')], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Готово: data/blocks.json и docs/BLOCKS.md обновлены.');
