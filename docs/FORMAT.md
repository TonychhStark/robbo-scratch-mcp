# Формат robbo-json — как описать программу для Robbo Scratch 3

Ты (ИИ) не пишешь `project.json` вручную. Ты пишешь программу в простом формате
**robbo-json**, а компилятор сам делает правильный `.sb3`: id блоков, связи,
тени (shadow), переменные, сообщения, костюмы.

Порядок работы:
1. Найди нужные блоки: `robbo_list_blocks` (category / query) и `robbo_block_info`.
   **Используй только opcode из этого списка.** Не выдумывай блоки.
2. Напиши программу robbo-json.
3. `robbo_validate` → исправь все ❌ ошибки (в них указан путь до блока и подсказка).
4. `robbo_build_sb3` с `output_path`, например `projects/имя.sb3`.
5. Покажи пользователю текстовый вид программы из ответа инструмента.

## Структура

```json
{
  "variables": {"счёт": 0},          // общие переменные (для всех спрайтов), необязательно
  "lists": {"путь": []},             // общие списки, необязательно
  "broadcasts": ["старт"],           // сообщения (создаются и сами, при использовании)
  "stage": {                         // необязательно
    "scripts": [ ... ],
    "backdrops": [{"name": "поле", "file": "img/field.png"}]
  },
  "sprites": [
    {
      "name": "Робот",
      "x": 0, "y": 0, "size": 100, "direction": 90, "visible": true,
      "rotationStyle": "all around",           // "left-right" | "don't rotate"
      "costumes": [{"name": "робот", "file": "img/robot.svg"}],  // необязательно; без него — стандартные костюмы
      "sounds": [{"name": "бип", "file": "snd/beep.wav"}],        // необязательно, только .wav
      "variables": {"скорость": 30},           // переменные только этого спрайта
      "lists": {},
      "procedures": [ ... ],                   // «Мои блоки», см. ниже
      "scripts": [ [блок, блок, ...], [ ... ] ]
    }
  ]
}
```

Короткая форма для одного спрайта: `{"scripts": [[...]]}` — спрайт «Спрайт1» создастся сам.

**Блоки Робота, Лаборатории, Коптера, Otto, Arduino и «Движение» работают только в спрайте, не на сцене.**

## Скрипт

Скрипт — массив блоков сверху вниз. Первый блок — «шапка» (hat):
`event_whenflagclicked`, `event_whenkeypressed`, `event_whenbroadcastreceived`,
`event_whenthisspriteclicked`, `control_start_as_clone` и т.д.

```json
[
  {"op": "event_whenflagclicked"},
  {"op": "robot_set_direction_to", "ROBOT_DIRECTION": "direction_forward"},
  {"op": "robot_motors_on_for_seconds", "SECONDS": 2}
]
```

## Блок

`{"op": "<opcode>", "<ИМЯ_ПОЛЯ>": значение, ...}` — имена полей ЗАГЛАВНЫМИ, как в `robbo_block_info`.
Неуказанные поля получают значения по умолчанию из палитры Robbo Scratch.

Что можно положить в поле:

| Поле | Значение |
|---|---|
| число/текст | `2`, `"привет"` |
| выпадающий список | внутреннее значение (`"direction_forward"`) или русская надпись (`"Вперёд"`) |
| круглое поле | другой блок-значение: `{"op": "robot_get_sensor_data", "ROBOT_SENSORS": "sensor1"}` |
| переменная | `{"var": "счёт"}` |
| список целиком | `{"list": "путь"}` |
| параметр своей процедуры | `{"arg": "секунд"}` |
| шестиугольное (условие) | только блок-условие: `{"op": "operator_gt", ...}`, `{"op": "robot_start_button_pressed"}` |
| вложенные блоки (SUBSTACK, SUBSTACK2) | массив блоков `[ ... ]` |
| цвет | `"#ff0000"` |

Поля переменных в блоках `data_*` — просто имя: `{"op": "data_changevariableby", "VARIABLE": "счёт", "VALUE": 1}`.
Сообщения: `{"op": "event_broadcast", "BROADCAST_INPUT": "старт"}` и
`{"op": "event_whenbroadcastreceived", "BROADCAST_OPTION": "старт"}`.

## Условия и циклы

```json
{"op": "control_forever", "SUBSTACK": [
  {"op": "control_if_else",
   "CONDITION": {"op": "operator_lt",
                 "OPERAND1": {"op": "robot_get_sensor_data", "ROBOT_SENSORS": "sensor1"},
                 "OPERAND2": 50},
   "SUBSTACK":  [{"op": "robot_motors_off"}],
   "SUBSTACK2": [{"op": "robot_motors_on"}]}
]}
```

`control_forever` и `control_stop` (со значением "all"/"this script") — завершающие: после них в том же скрипте блоков быть не может.

## Свои блоки (процедуры)

```json
"procedures": [
  {"name": "проехать", "params": [{"name": "секунд", "type": "number"}],
   "warp": false,
   "body": [
     {"op": "robot_set_direction_to", "ROBOT_DIRECTION": "Вперёд"},
     {"op": "robot_motors_on_for_seconds", "SECONDS": {"arg": "секунд"}}
   ]}
]
```
Типы параметров: `"number"` (число/текст) или `"boolean"` (условие).
Вызов: `{"op": "call", "proc": "проехать", "args": {"секунд": 1.5}}`.
Процедура доступна только в своём спрайте.

## Частые ошибки
- Блок-значение (круглый/шестиугольный) нельзя ставить как отдельную команду в скрипт.
- Команду нельзя вставить в поле.
- В шестиугольное поле — только блок-условие, не число.
- Значения выпадающих списков — строго из списка (`robbo_block_info` показывает варианты).
- Время в секундах, мощность моторов в процентах (0–100), углы в градусах.
