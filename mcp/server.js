#!/usr/bin/env node
'use strict';
// Zero-dependency MCP server (stdio, JSON-RPC 2.0) for generating Robbo Scratch 3 .sb3 files.
const api = require('../lib/api');
const { CATEGORY_RU } = require('../lib/catalog');

const PROGRAM_SCHEMA = {
  type: 'object',
  description: 'Программа в формате robbo-json (см. robbo_format_guide). Пример: {"sprites":[{"name":"Робот","scripts":[[{"op":"event_whenflagclicked"},{"op":"robot_motors_on_for_seconds","SECONDS":2}]]}]}',
  additionalProperties: true,
};
const TOOLS = [
  {
    name: 'robbo_format_guide',
    description: 'ПРОЧИТАЙ ПЕРВЫМ. Описание формата robbo-json, по которому собирается .sb3 для Robbo Scratch 3: спрайты, скрипты, блоки, переменные, процедуры, примеры.',
    inputSchema: { type: 'object', properties: {} },
    run: () => ({ ok: true, text: api.guide() }),
  },
  {
    name: 'robbo_list_blocks',
    description: `Список доступных блоков Robbo Scratch с их opcode, русским названием, полями и допустимыми значениями. Фильтры: category (${Object.keys(CATEGORY_RU).join(', ')}) и/или query (слова из названия, например "мотор", "датчик", "светодиод").`,
    inputSchema: { type: 'object', properties: { category: { type: 'string' }, query: { type: 'string' } } },
    run: a => ({ ok: true, text: api.listBlocks(a) }),
  },
  {
    name: 'robbo_block_info',
    description: 'Подробности по конкретным блокам (по opcode): поля, допустимые значения, форма, пример JSON.',
    inputSchema: { type: 'object', properties: { opcodes: { type: 'array', items: { type: 'string' } } }, required: ['opcodes'] },
    run: a => ({ ok: true, text: api.blockInfo(a.opcodes) }),
  },
  {
    name: 'robbo_validate',
    description: 'Проверить программу robbo-json без создания файла. Возвращает ошибки (с путём до блока и подсказками) и текстовый вид программы, как в Robbo Scratch.',
    inputSchema: { type: 'object', properties: { program: PROGRAM_SCHEMA, program_path: { type: 'string', description: 'Альтернатива: путь к .json файлу с программой' } } },
    run: a => api.validate(a),
  },
  {
    name: 'robbo_build_sb3',
    description: 'Собрать .sb3 файл для Robbo Scratch 3 из программы robbo-json и сохранить на диск. При ошибках файл не создаётся — исправь ошибки и вызови снова. Рядом сохраняется исходник .robbo.json.',
    inputSchema: {
      type: 'object',
      properties: {
        program: PROGRAM_SCHEMA,
        program_path: { type: 'string', description: 'Альтернатива: путь к .json файлу с программой' },
        output_path: { type: 'string', description: 'Куда сохранить, например projects/robot_square.sb3 (относительно папки проекта) или абсолютный путь' },
        save_program: { type: 'boolean', description: 'Сохранять ли рядом .robbo.json (по умолчанию да)' },
      },
      required: ['output_path'],
    },
    run: a => api.build(a),
  },
  {
    name: 'robbo_read_sb3',
    description: 'Прочитать существующий .sb3 (сделанный в Robbo Scratch или этим инструментом) и вернуть его в формате robbo-json + в виде текста. Используй, чтобы объяснить или доработать готовый проект.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' }, assets_dir: { type: 'string', description: 'Необязательно: папка, куда выгрузить свои костюмы/звуки проекта' } }, required: ['path'] },
    run: a => api.read(a),
  },
];

const send = msg => process.stdout.write(JSON.stringify(msg) + '\n');
const reply = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: (params && params.protocolVersion) || '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'robbo-scratch', version: '1.0.0' },
      instructions: 'Генерация .sb3 для Robbo Scratch 3. Порядок: robbo_format_guide → robbo_list_blocks → robbo_validate → robbo_build_sb3.',
    });
  }
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS.map(({ run, ...t }) => t) });
  if (method === 'tools/call') {
    const tool = TOOLS.find(t => t.name === (params && params.name));
    if (!tool) return fail(id, -32602, `Unknown tool ${params && params.name}`);
    try {
      const r = tool.run((params && params.arguments) || {});
      return reply(id, { content: [{ type: 'text', text: r.text }], isError: !r.ok });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: `Ошибка: ${e.message}` }], isError: true });
    }
  }
  if (method === 'resources/list') return reply(id, { resources: [] });
  if (method === 'prompts/list') return reply(id, { prompts: [] });
  if (id !== undefined && id !== null) return fail(id, -32601, `Method not found: ${method}`);
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch (e) { fail(null, -32700, 'Parse error'); continue; }
    if (Array.isArray(msg)) msg.forEach(handle); else handle(msg);
  }
});
process.stdin.on('end', () => process.exit(0));
