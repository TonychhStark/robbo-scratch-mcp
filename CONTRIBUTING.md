# Как помочь проекту

Спасибо, что хотите помочь! Проект без зависимостей — нужен только Node.js.

## Начать

```
git clone https://github.com/TonychhStark/robbo-scratch-mcp
cd robbo-scratch-mcp
npm test
```

## Куда что класть

| Что | Где |
|---|---|
| Компилятор robbo-json → `.sb3` | `lib/compiler.js` |
| Чтение `.sb3` | `lib/decompiler.js` |
| MCP-сервер | `mcp/server.js` |
| Каталог блоков | `data/blocks.json` (генерируется, не правьте вручную) |
| Описание формата для ИИ | `docs/FORMAT.md` |
| Примеры | `examples/*.json` + собранные `.sb3` |

## Правила

- **Без зависимостей.** Только встроенные модули Node.js (≥ 14).
- **Каталог блоков** обновляется из установленного Robbo Scratch:
  `node tools/update-from-robbo.js "C:\путь\к\robboscratch3"`.
- **Новый пример** — положите `examples/имя.json`, соберите
  `node cli.js build examples/имя.json examples/имя.sb3` и проверьте в Robbo Scratch.
- Сообщения об ошибках для пользователя — по-русски, понятным языком, с подсказкой.
- Перед PR запустите `npm test`.
