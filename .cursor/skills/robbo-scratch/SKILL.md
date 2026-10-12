---
name: robbo-scratch
description: Create, read, explain or modify Robbo Scratch 3 projects (.sb3) for Robbo robot, Laboratory, quadcopter, Otto dancing robot, Arduino and plain Scratch games. Use when the user asks for a Robbo/РобоСкретч/Scratch program or an .sb3 file.
---

# Robbo Scratch 3 (.sb3)

Workflow (never hand-write project.json):
1. Read `docs/FORMAT.md` (or MCP tool `robbo_format_guide`).
2. Find blocks: MCP `robbo_list_blocks` / `robbo_block_info`, or `node cli.js blocks <category> [words]`, `node cli.js info <opcode>`; full list in `docs/BLOCKS.md`.
3. Write the program as robbo-json into `projects/<name>.robbo.json`.
4. Validate: MCP `robbo_validate` or `node cli.js check projects/<name>.robbo.json`. Fix every ❌.
5. Build: MCP `robbo_build_sb3` or `node cli.js build projects/<name>.robbo.json projects/<name>.sb3`.
6. Show the user the text rendering returned by the tool and explain what to connect.

To modify an existing project: `robbo_read_sb3` / `node cli.js read file.sb3` → edit the robbo-json → build again.
Debugging / tuning values (thresholds, power, angles, timing): build with `debug: true` (MCP) or `--debug` (CLI) →
the user runs it with the green flag and saves the project (File → Save to your computer) into `projects/` →
`robbo_read_log` / `node cli.js log file.sb3` → find the cause from sensor values and chosen branches → edit the
`.robbo.json` (never the debug .sb3) → build again. Log lines look like
`[12:40:15] Датчик1 = 12 (< 50) поэтому Повернуть направо на 45 градусов`.

Talk to the user in Russian.
