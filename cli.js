#!/usr/bin/env node
'use strict';
// CLI: node cli.js <command> ...
const api = require('./lib/api');
const [cmd, ...args] = process.argv.slice(2);
const usage = `Robbo Scratch .sb3 генератор
  node cli.js build <программа.json> <выход.sb3>   собрать .sb3
  node cli.js check <программа.json>               проверить программу
  node cli.js read  <файл.sb3> [папка_для_костюмов] показать проект как robbo-json
  node cli.js show  <программа.json>               показать программу текстом
  node cli.js blocks [категория] [поиск]           список блоков
  node cli.js info  <opcode> [opcode...]           подробности о блоках`;
try {
  let r;
  switch (cmd) {
    case 'build': r = api.build({ program_path: args[0], output_path: args[1] || args[0].replace(/\.json$/i, '') + '.sb3', save_program: false }); break;
    case 'check': r = api.validate({ program_path: args[0] }); break;
    case 'read': r = api.read({ path: args[0], assets_dir: args[1] }); break;
    case 'show': r = { ok: true, text: api.render(JSON.parse(require('fs').readFileSync(args[0], 'utf8'))) }; break;
    case 'blocks': r = { ok: true, text: api.listBlocks({ category: args[0] && args[0] !== '-' ? args[0] : undefined, query: args.slice(1).join(' ') || undefined }) }; break;
    case 'info': r = { ok: true, text: api.blockInfo(args) }; break;
    default: console.log(usage); process.exit(cmd ? 1 : 0);
  }
  console.log(r.text);
  process.exit(r.ok ? 0 : 1);
} catch (e) { console.error('Ошибка:', e.message); process.exit(1); }
