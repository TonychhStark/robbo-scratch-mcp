# robbo-sb3 — ИИ делает проекты для Robbo Scratch 3

[![Тесты](https://github.com/TonychhStark/robbo-scratch-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/TonychhStark/robbo-scratch-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Node.js ≥14](https://img.shields.io/badge/node-%E2%89%A514-brightgreen)
![MCP](https://img.shields.io/badge/MCP-server-blue)
![Блоков: 223](https://img.shields.io/badge/%D0%B1%D0%BB%D0%BE%D0%BA%D0%BE%D0%B2-223-orange)

[English version](README.en.md)

Набор для Cursor IDE: ИИ-агент пишет программу в простом формате, а инструмент
собирает из неё настоящий `.sb3`, который открывается в Robbo Scratch 3.

- **223 блока** взяты прямо из вашей программы Robbo Scratch 3: Робот, Лаборатория,
  Квадрокоптер, Otto, Arduino, IoT и все стандартные блоки Scratch, плюс Перо.
- Проверка ошибок понятным языком: неизвестный блок, неверное значение списка,
  команда в поле и т.п., с подсказками.
- Чтение готовых `.sb3`, чтобы ИИ объяснил или доработал проект.
- **Без зависимостей.** Нужен только Node.js, `npm install` не нужен.

## Установка (5 минут)

1. Установите **Node.js** (LTS) с https://nodejs.org, если его ещё нет.
   Проверка в терминале: `node -v`.
2. Распакуйте эту папку, например в `C:\robbo-sb3`.
3. В Cursor: **File → Open Folder…** → выберите `robbo-sb3`.
4. Cursor найдёт `.cursor/mcp.json` и предложит включить MCP-сервер **robbo-scratch**.
   Включите его: **Settings → MCP → robbo-scratch** (должен гореть зелёным, 7 инструментов).
5. Откройте чат агента (Ctrl+I) и напишите, например:
   > Сделай программу для робота Robbo: по зелёному флагу ехать вперёд 2 секунды,
   > потом повернуть направо на 90 градусов, и так 4 раза (квадрат).

   Готовый файл появится в папке `projects/`. В Robbo Scratch откройте его через
   **Файл → Загрузить с компьютера**.

> Если MCP-сервер не запускается из-за `${workspaceFolder}`, впишите абсолютные
> пути в `.cursor/mcp.json`, например
> `"args": ["C:/robbo-sb3/mcp/server.js"]` и `"ROBBO_WORKDIR": "C:/robbo-sb3"`.

## Другие ИИ-клиенты (без скачивания папки)

Сервер можно запускать прямо из GitHub через `npx` (нужен Node.js ≥ 18 и git).
`ROBBO_WORKDIR` — папка, куда будут сохраняться проекты.

**Claude Desktop** — `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "robbo-scratch": {
      "command": "npx",
      "args": ["-y", "-p", "github:TonychhStark/robbo-scratch-mcp", "robbo-sb3-mcp"],
      "env": { "ROBBO_WORKDIR": "C:/Users/я/Documents/robbo" }
    }
  }
}
```

**VS Code (Copilot)** — `.vscode/mcp.json`:
```json
{
  "servers": {
    "robbo-scratch": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "github:TonychhStark/robbo-scratch-mcp", "robbo-sb3-mcp"],
      "env": { "ROBBO_WORKDIR": "${workspaceFolder}" }
    }
  }
}
```

**Claude Code:**
```
claude mcp add robbo-scratch -- npx -y -p github:TonychhStark/robbo-scratch-mcp robbo-sb3-mcp
```

Windsurf, Cline и другие клиенты: та же команда `npx` с аргументами в их настройках MCP.

Сервер даёт 7 инструментов и 2 ресурса с документацией
(`robbo://docs/format`, `robbo://docs/blocks`).

## Что умеет агент

| Попросите | Что произойдёт |
|---|---|
| «Сделай …» | ИИ подберёт блоки, проверит программу, сохранит `projects/имя.sb3` и `имя.robbo.json` |
| «Объясни проект `файл.sb3`» | ИИ прочитает файл и расскажет, как он работает |
| «Добавь в `файл.sb3` …» | прочитает, изменит и сохранит новую версию |

## Отладка: лог работы робота 🐞

Попросите агента: *«Робот съезжает с линии, включи отладку»*. Агент соберёт программу
с режимом отладки, и при запуске она сама будет писать лог в список «лог» на сцене:

```
[12:40:15] ▶ Старт (Робот)
[12:40:16] Датчик1 = 12 (< 50) поэтому Повернуть направо на 45 градусов
[12:40:17] Датчик1 = 63 (≥ 50) поэтому Моторы вкл
```

1. Откройте отладочный `.sb3` в Robbo Scratch и нажмите зелёный флаг.
2. Когда робот закончит (или нажмите стоп): **Файл → Сохранить на компьютер** в папку `projects/`.
3. Напишите агенту: *«сохранил, посмотри лог»*. Он прочитает лог (`robbo_read_log`), сохранит копию
   в `logs/`, найдёт причину и подкрутит значения: пороги датчиков, мощность, углы, время.

> Почему не монитор COM-порта: порт робота занят самим Robbo Scratch, а в байтах протокола нет
> смысла «почему» робот повернул. Лог изнутри программы показывает и значения датчиков, и решение.

## Без ИИ: командная строка

```
node cli.js blocks robot                 # блоки Робота
node cli.js blocks - датчик              # поиск по словам
node cli.js info robot_turnright         # подробности о блоке
node cli.js check examples/robot_square.json
node cli.js build examples/robot_square.json projects/square.sb3
node cli.js read projects/square.sb3     # .sb3 → текст + robbo-json
node cli.js build examples/robot_line_follower.json projects/lf.sb3 --debug   # сборка с логом
node cli.js log projects/lf.sb3          # прочитать лог после запуска
npm test                                 # самопроверка
```

## Папки

| Путь | Что это |
|---|---|
| `mcp/server.js` | MCP-сервер (stdio) |
| `cli.js` | командная строка |
| `lib/` | компилятор, декомпилятор, ZIP, проверка, режим отладки (`debug.js`) |
| `logs/` | сохранённые логи отладки (создаётся сама, в git не попадает) |
| `data/blocks.json` | каталог блоков, извлечённый из Robbo Scratch 3 |
| `docs/FORMAT.md` | формат программы (для ИИ) |
| `docs/BLOCKS.md` | все блоки с допустимыми значениями |
| `examples/` | примеры: квадрат, езда по линии, светофор на Лаборатории, коптер, Otto, Arduino, игра |
| `.cursor/` | настройки Cursor: MCP, правило, скилл |
| `tools/` | извлечение блоков из Robbo Scratch (если программа обновится) |

## Если Robbo Scratch обновился

```
node tools/update-from-robbo.js "C:\путь\к\robboscratch3"
```
Блоки заново извлекаются из `package.nw/build/lib.min.js.map`.

## Ограничения

- Звуки можно добавлять только в формате `.wav`, костюмы — `.svg`, `.png` или `.jpg`.
- Блоки «Набор расширений» (датчик цвета, клешня) появятся в палитре, только если
  набор включён в Robbo Scratch.
- Блоки, которые разработчики Robbo скрыли или не доделали, исключены из каталога.

## Участие и лицензия

Ошибки и пожелания — в [Issues](https://github.com/TonychhStark/robbo-scratch-mcp/issues),
как помочь — в [CONTRIBUTING.md](CONTRIBUTING.md), история изменений — в [CHANGELOG.md](CHANGELOG.md).
Лицензия — [MIT](LICENSE).
