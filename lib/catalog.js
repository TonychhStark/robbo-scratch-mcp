'use strict';
const path = require('path');
const BLOCKS = require(path.join(__dirname, '..', 'data', 'blocks.json'));

const PRIMITIVE = {
  math_number: 4, math_positive_number: 5, math_whole_number: 6,
  math_integer: 7, math_angle: 8, colour_picker: 9, text: 10,
};
const PRIMITIVE_FIELD = {
  math_number: 'NUM', math_positive_number: 'NUM', math_whole_number: 'NUM',
  math_integer: 'NUM', math_angle: 'NUM', colour_picker: 'COLOUR', text: 'TEXT',
};
const CATEGORY_RU = {
  robot: 'Робот', laboratory: 'Лаборатория', quadcopter: 'Квадрокоптер', otto: 'Танцующий робот (Otto)',
  newcat: 'Arduino', iotblocks: 'IoT', motion: 'Движение', looks: 'Внешний вид', sound: 'Звук',
  events: 'События', control: 'Управление', sensing: 'Сенсоры', operators: 'Операторы',
  data: 'Переменные и списки', procedures: 'Мои блоки', pen: 'Перо',
};
const norm = s => String(s).trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');

/** Map a user-supplied menu/dropdown value to the internal value. Returns {value, ok}. */
function resolveOption(options, v) {
  if (!options) return { value: String(v), ok: true };
  const s = String(v);
  for (const o of options) if (String(o.value) === s) return { value: o.value, ok: true };
  const n = norm(s);
  for (const o of options) {
    if ((o.ru && norm(o.ru) === n) || (o.en && norm(o.en) === n) || norm(o.value) === n) return { value: o.value, ok: true };
  }
  return { value: s, ok: false };
}

function levenshtein(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function suggestOpcodes(op, n = 5) {
  const q = norm(op);
  return Object.values(BLOCKS)
    .map(b => {
      let score = levenshtein(q, b.opcode.toLowerCase());
      if (b.ru && norm(b.ru).includes(q)) score -= 100;
      if (b.opcode.includes(q)) score -= 50;
      return { op: b.opcode, score };
    })
    .sort((a, b) => a.score - b.score).slice(0, n).map(x => x.op);
}

function searchBlocks({ category, query } = {}) {
  let list = Object.values(BLOCKS);
  if (category) {
    const c = norm(category);
    list = list.filter(b => norm(b.category) === c || norm(CATEGORY_RU[b.category] || '') === c || (b.device && norm(b.device) === c));
  }
  if (query) {
    const words = norm(query).split(' ');
    list = list.filter(b => {
      const hay = norm(`${b.opcode} ${b.ru} ${b.en} ${b.inputs.map(i => (i.menu && i.menu.options || []).map(o => o.ru + ' ' + o.en).join(' ')).join(' ')}`);
      return words.every(w => hay.includes(w));
    });
  }
  return list;
}

module.exports = { BLOCKS, PRIMITIVE, PRIMITIVE_FIELD, CATEGORY_RU, resolveOption, suggestOpcodes, searchBlocks, norm };
