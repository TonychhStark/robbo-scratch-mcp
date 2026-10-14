# robbo-sb3 — AI builds projects for Robbo Scratch 3

[![Tests](https://github.com/TonychhStark/robbo-scratch-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/TonychhStark/robbo-scratch-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Node.js ≥14](https://img.shields.io/badge/node-%E2%89%A514-brightgreen)
![MCP](https://img.shields.io/badge/MCP-server-blue)

[Русская версия](README.md)

An MCP server and CLI that let an AI agent (Cursor, Claude, Copilot…) write a program
in a simple JSON format and compile it into a real `.sb3` file that opens in
**Robbo Scratch 3** — the Scratch-based environment for Robbo educational robots.

- **223 blocks** extracted from Robbo Scratch 3 itself: Robot, Laboratory, Quadcopter,
  Otto, Arduino, IoT, plus all standard Scratch 3 blocks and Pen.
- Clear validation errors (unknown block, wrong dropdown value, command in an input…) with hints.
- Reads existing `.sb3` files so the AI can explain or extend a project.
- **Zero dependencies.** Only Node.js is required — no `npm install`.

> Block names, messages and docs are in Russian, as in Robbo Scratch. Dropdown values
> accept either the internal value (`"direction_forward"`) or the Russian label (`"Вперёд"`).

## Quick start

### Cursor
1. Install Node.js LTS.
2. Clone or download this repository and open the folder in Cursor.
3. Enable the **robbo-scratch** MCP server (Settings → MCP). It is configured in `.cursor/mcp.json`.
4. Ask the agent, e.g. *"Make a Robbo robot program: on green flag drive forward 2 s, turn right 90°, repeat 4 times."*
5. The file appears in `projects/`. In Robbo Scratch: **File → Load from your computer**.

### Any MCP client via npx
```json
{
  "mcpServers": {
    "robbo-scratch": {
      "command": "npx",
      "args": ["-y", "-p", "github:TonychhStark/robbo-scratch-mcp", "robbo-sb3-mcp"],
      "env": { "ROBBO_WORKDIR": "/path/where/projects/are/saved" }
    }
  }
}
```
Claude Code: `claude mcp add robbo-scratch -- npx -y -p github:TonychhStark/robbo-scratch-mcp robbo-sb3-mcp`

## MCP tools

| Tool | Purpose |
|---|---|
| `robbo_format_guide` | Format of robbo-json (read first) |
| `robbo_list_blocks` | Blocks by category / keywords |
| `robbo_block_info` | Fields, allowed values, example for given opcodes |
| `robbo_validate` | Check a program, get errors and a text rendering |
| `robbo_build_sb3` | Build and save `.sb3` (+ source `.robbo.json`) |
| `robbo_read_sb3` | Read an existing `.sb3` back into robbo-json |
| `robbo_read_log` | Read the debug log after a run, save it to `logs/`, sensor stats |

Resources: `robbo://docs/format`, `robbo://docs/blocks`.

## Example program

```json
{"sprites": [{"name": "Robot", "scripts": [[
  {"op": "event_whenflagclicked"},
  {"op": "control_repeat", "TIMES": 4, "SUBSTACK": [
    {"op": "robot_set_direction_to", "ROBOT_DIRECTION": "direction_forward"},
    {"op": "robot_motors_on_for_seconds", "SECONDS": 2},
    {"op": "robot_turnright", "DEGREES": 90}
  ]}
]]}]}
```
More in [`examples/`](examples) and the full format in [`docs/FORMAT.md`](docs/FORMAT.md).

## Debug log

Build with `debug: true` (or `node cli.js build x.json x.sb3 --debug`) and the program writes
a log into the list «лог» while it runs:
```
[12:40:16] Датчик1 = 12 (< 50) поэтому Повернуть направо на 45 градусов
```
("Sensor1 = 12 (< 50) therefore turn right 45°"). After the run, save the project in Robbo Scratch
and call `robbo_read_log` (or `node cli.js log file.sb3`): the agent sees sensor values and chosen
branches and can tune thresholds, power, angles and timing. Endless loops are logged only when the
path changes (and once per second otherwise).

Step-by-step testing and limitations (Russian): [docs/DEBUG.md](docs/DEBUG.md).

## CLI

```
node cli.js blocks robot                 # Robot blocks
node cli.js info robot_turnright         # block details
node cli.js check examples/robot_square.json
node cli.js build examples/robot_square.json projects/square.sb3
node cli.js read projects/square.sb3     # .sb3 → text + robbo-json
npm test
```

## Updating the block catalog

If Robbo Scratch is updated: `node tools/update-from-robbo.js "C:\path\to\robboscratch3"` —
blocks are re-extracted from `package.nw/build/lib.min.js.map`.

## Limitations
- Sounds: `.wav` only; costumes: `.svg`, `.png`, `.jpg`.
- "Extension kit" blocks (color sensor, claw) appear only if the kit is enabled in Robbo Scratch.
- Blocks hidden or unfinished by Robbo developers are excluded.

## Contributing & license
See [CONTRIBUTING.md](CONTRIBUTING.md) (in Russian) and [CHANGELOG.md](CHANGELOG.md). MIT — see [LICENSE](LICENSE).
