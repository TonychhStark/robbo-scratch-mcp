'use strict';
// High-level operations shared by the MCP server and the CLI.
const fs = require('fs');
const path = require('path');
const { BLOCKS, CATEGORY_RU, searchBlocks } = require('./catalog');
const { compile, buildSb3, CompileError } = require('./compiler');
const { decompile } = require('./decompiler');
const { render } = require('./render');

const WORKDIR = () => process.env.ROBBO_WORKDIR || process.cwd();
const resolvePath = p => (path.isAbsolute(p) ? p : path.resolve(WORKDIR(), p));

function describeInput(i) {
  if (i.kind === 'statement') return `${i.name}: [блоки внутри]`;
  if (i.kind === 'boolean') return `${i.name}: <условие-блок>`;
  if (i.menu && i.menu.variableType === 'broadcast_msg') return `${i.name}: "имя сообщения" (или блок)`;
  if (i.menu && i.menu.options && !i.menu.dynamic) return `${i.name}: ${i.menu.options.map(o => `"${o.value}"=${o.ru || o.en}`).join(' | ')} (или блок)`;
  if (i.menu) return `${i.name}: имя/значение${i.menu.options ? ' (' + i.menu.options.map(o => `"${o.value}"=${o.ru || o.en}`).join(', ') + ', или имя спрайта/костюма/звука)' : ''} (или блок)`;
  const t = { math_number: 'число', math_positive_number: 'число ≥0', math_whole_number: 'целое ≥0', math_integer: 'целое', math_angle: 'угол', colour_picker: '"#rrggbb"', text: 'текст/число' }[i.shadow] || 'значение';
  return `${i.name}: ${t}${i.default !== undefined && i.default !== '' ? ` (по умолч. ${JSON.stringify(i.default)})` : ''}`;
}
function describeField(f) {
  if (f.kind === 'dropdown') return `${f.name}: ${f.options ? f.options.map(o => `"${o.value}"=${o.ru || o.en}`).join(' | ') : 'значение'}`;
  if (f.kind === 'variable') return `${f.name}: "имя переменной"`;
  if (f.kind === 'list') return `${f.name}: "имя списка"`;
  if (f.kind === 'broadcast') return `${f.name}: "имя сообщения"`;
  return `${f.name}: значение`;
}
const SHAPE_RU = { hat: 'шапка (старт скрипта)', stack: 'команда', c: 'C-блок (с вложенными)', c_end: 'C-блок, завершающий', cap: 'завершающая команда', reporter: 'значение (круглое)', boolean: 'условие (шестиугольное)' };

function listBlocks({ category, query } = {}) {
  const list = searchBlocks({ category, query }).filter(b => b.opcode !== 'procedures_call' && b.opcode !== 'procedures_definition');
  if (!list.length) return `Ничего не найдено. Категории: ${Object.entries(CATEGORY_RU).map(([k, v]) => `${k} (${v})`).join(', ')}`;
  const byCat = {};
  for (const b of list) (byCat[b.category] = byCat[b.category] || []).push(b);
  return Object.entries(byCat).map(([c, bs]) => `## ${CATEGORY_RU[c] || c} [${c}]\n` + bs.map(b => `- ${b.opcode} — «${b.ru || b.en}» (${SHAPE_RU[b.shape]})${b.note ? ' ⚠ ' + b.note : ''}` + (b.inputs.length + b.fields.length ? `\n    ${[...b.fields.map(describeField), ...b.inputs.map(describeInput)].join('\n    ')}` : '')).join('\n')).join('\n\n');
}

function blockInfo(opcodes) {
  return (Array.isArray(opcodes) ? opcodes : [opcodes]).map(op => {
    const b = BLOCKS[op];
    if (!b) { const { suggestOpcodes } = require('./catalog'); return `${op}: не найден. Похожие: ${suggestOpcodes(op).join(', ')}`; }
    const ex = { op: b.opcode };
    for (const f of b.fields) ex[f.name] = f.kind === 'dropdown' ? f.default : f.kind === 'list' ? 'мой список' : f.kind === 'broadcast' ? 'сообщение1' : 'моя переменная';
    for (const i of b.inputs) ex[i.name] = i.kind === 'statement' ? [] : i.kind === 'boolean' ? { op: 'operator_gt', OPERAND1: 1, OPERAND2: 0 } : (/^math_/.test(i.shadow || '') && i.default !== '' && !isNaN(Number(i.default)) ? Number(i.default) : i.default ?? '');
    return `### ${b.opcode}\nКатегория: ${CATEGORY_RU[b.category] || b.category}${b.device ? ` (устройство: ${b.device})` : ''}${b.extension ? ` (расширение ${b.extension})` : ''}\nВ Robbo Scratch: «${b.ru}»  /  EN: «${b.en}»\nФорма: ${SHAPE_RU[b.shape]}\n${b.note ? 'Важно: ' + b.note + '\n' : ''}Поля:\n${[...b.fields.map(describeField), ...b.inputs.map(describeInput)].map(s => '  ' + s).join('\n') || '  (нет)'}\nПример: ${JSON.stringify(ex)}`;
  }).join('\n\n');
}

// JSON.parse that tolerates // and /* */ comments and trailing commas (AI often adds them)
function parseJsonLoose(text) {
  try { return JSON.parse(text); } catch (e0) {
    let out = '', i = 0, inStr = false;
    while (i < text.length) {
      const c = text[i], n = text[i + 1];
      if (inStr) { out += c; if (c === '\\') { out += n || ''; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
      if (c === '"') { inStr = true; out += c; i++; continue; }
      if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
      if (c === '/' && n === '*') { i = text.indexOf('*/', i + 2); i = i < 0 ? text.length : i + 2; continue; }
      out += c; i++;
    }
    out = out.replace(/,(\s*[}\]])/g, '$1');
    try { return JSON.parse(out); } catch (e) { throw new Error('Программа — некорректный JSON: ' + e0.message); }
  }
}

function readProgram({ program, program_path }) {
  if (program_path) {
    const p = resolvePath(program_path);
    return { spec: parseJsonLoose(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')), baseDir: path.dirname(p) };
  }
  if (typeof program === 'string') return { spec: parseJsonLoose(program), baseDir: WORKDIR() };
  if (program && typeof program === 'object') return { spec: program, baseDir: WORKDIR() };
  throw new Error('Передайте program (JSON-объект программы) или program_path (путь к .json)');
}

function validate(args) {
  const { spec, baseDir } = readProgram(args);
  const r = compile(spec, { baseDir });
  let text = '';
  if (r.errors.length) text += `❌ Ошибки (${r.errors.length}):\n${r.errors.map(e => ' - ' + e).join('\n')}\n\n`;
  else text += '✅ Ошибок нет.\n\n';
  if (r.warnings.length) text += `⚠️ Предупреждения:\n${r.warnings.map(e => ' - ' + e).join('\n')}\n\n`;
  if (!r.errors.length) text += `Как это будет выглядеть в Robbo Scratch:\n${render(spec)}`;
  return { ok: !r.errors.length, text };
}

function build(args) {
  const { spec, baseDir } = readProgram(args);
  if (!args.output_path) throw new Error('Укажите output_path — куда сохранить .sb3');
  let out = resolvePath(args.output_path);
  if (!out.toLowerCase().endsWith('.sb3')) out += '.sb3';
  try {
    const r = buildSb3(spec, { baseDir });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, r.buffer);
    if (args.save_program !== false) {
      const jp = out.replace(/\.sb3$/i, '.robbo.json');
      if (!args.program_path || resolvePath(args.program_path) !== jp) fs.writeFileSync(jp, JSON.stringify(spec, null, 2));
    }
    const nBlocks = r.project.targets.reduce((n, t) => n + Object.keys(t.blocks).length, 0);
    return { ok: true, text: `✅ Сохранено: ${out}\n(блоков: ${nBlocks}${args.save_program !== false ? `; рядом сохранён исходник ${path.basename(out).replace(/\.sb3$/i, '.robbo.json')}` : ''})\nОткройте в Robbo Scratch: Файл → Загрузить с компьютера.\n` + (r.warnings.length ? `\n⚠️ Предупреждения:\n${r.warnings.map(e => ' - ' + e).join('\n')}\n` : '') + `\nПрограмма:\n${render(spec)}` };
  } catch (e) {
    if (e instanceof CompileError) return { ok: false, text: `❌ Файл НЕ создан. Исправьте ошибки и повторите:\n${e.errors.map(x => ' - ' + x).join('\n')}` + (e.warnings.length ? `\n\n⚠️ Предупреждения:\n${e.warnings.map(x => ' - ' + x).join('\n')}` : '') };
    throw e;
  }
}

function read({ path: p, assets_dir }) {
  const file = resolvePath(p);
  const assetsDir = assets_dir ? resolvePath(assets_dir) : file.replace(/\.sb3$/i, '') + '_assets';
  const { spec, warnings } = decompile(file, { assetsDir, baseDir: path.dirname(file) });
  return { ok: true, spec, text: `Файл: ${file}\n` + (fs.existsSync(assetsDir) ? `Свои костюмы/звуки выгружены в: ${assetsDir}\n` : '') + (warnings.length ? `⚠️ ${warnings.join('\n⚠️ ')}\n` : '') + `\nКак выглядит:\n${render(spec)}\n\nПрограмма в формате robbo-json:\n${JSON.stringify(spec, null, 1)}` };
}

function guide() {
  return fs.readFileSync(path.join(__dirname, '..', 'docs', 'FORMAT.md'), 'utf8');
}

module.exports = { parseJsonLoose, listBlocks, blockInfo, validate, build, read, guide, render };
