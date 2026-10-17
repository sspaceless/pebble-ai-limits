# Preview images

Previews are grouped by device: watch captures under `watches/<platform>/` and phone settings under `phone/`.

```text
preview/
├── watches/
│   ├── aplite/   Classic / Steel
│   ├── basalt/   Time / Time Steel
│   ├── chalk/    Time Round
│   ├── diorite/  Pebble 2
│   ├── emery/    Time 2
│   ├── flint/    Pebble 2 Duo
│   └── gabbro/   Round 2
└── phone/        Account-list and inline-flow screenshots
```

## Watch platforms

| SDK platform | Watch type | Available previews |
| --- | --- | --- |
| `aplite` | Classic / Steel | [All six provider previews](watches/aplite/) |
| `basalt` | Time / Time Steel | [All six provider previews](watches/basalt/) |
| `chalk` | Time Round | [All six provider previews](watches/chalk/) |
| `diorite` | Pebble 2 | [All six provider previews](watches/diorite/) |
| `emery` | Time 2 | [All six provider previews](watches/emery/) |
| `flint` | Pebble 2 Duo | [All six provider previews](watches/flint/) |
| `gabbro` | Round 2 | [All six provider previews](watches/gabbro/) |

Each platform directory contains `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png`, and `custom.png`, captured from that platform's SDK emulator. All use demonstration data; API caps do not show reset timers, and no provider authentication was performed. The captures show the current provider marks. Old letter-placeholder provider marks, legacy screens, diagnostic images, and animations containing old artwork have been removed. Current progress and sync animation captures still need to be produced.

For new platforms, add their first real screenshot under `watches/<SDK platform>/`. Choose the actual emulator/device platform; matching screen dimensions alone is not enough to assign a platform. Use provider names such as `codex.png` and `claude.png`, with descriptive names for interactions and animations.

## Phone screenshots

[`phone/`](phone/) contains six screenshots generated on 18 October 2026 from the main settings page exported by `src/pkjs/config.js`. `settings.png` and `connected.png` show the account list. `add-account.png`, `rename-account.png`, `connection.png`, and `login.png` show the account-creation, rename, Claude connection, and Codex device-login flows inline on that same page. The device-login screen uses a simulated `DEMO-ONLY` code; no provider authentication is performed.

The account-list captures show the normal client-side rendering after selecting a demo profile. Initial and subsequent account-list rendering both create real nested markup while escaping account labels. All names and the login code are demonstration data.

All phone previews use the same format and canvas: **PNG, 500 × 1200 pixels, scale factor 1**. Pages keep their natural layout at the top of the shared viewport; shorter pages retain the normal page background below their content. Captures are not stretched or cropped.

Regenerate the complete set from the current renderer with:

```sh
npm run generate:previews:phone
```

The command requires Chrome/Chromium; set `CHROME_BIN` if its executable is not detected automatically. Temporary HTML and isolated browser profiles stay outside the repository. Generation checks page overflow and PNG dimensions before replacing any output files. If a future page exceeds the viewport, change the shared `SIZE` in `tools/generate-phone-previews.mjs` and regenerate every phone preview together.

These screenshots replace the archived HTML-demo captures. Regenerate them when the UI changes.

## Artifact policy

Preview artifacts must be images (PNG, WebP, or JPEG) or animations (GIF). Do not add saved HTML demos. Keep temporary rendering HTML outside the repository. Capture current watch UI through the appropriate Pebble emulator or device. Store standalone icon studies under `icons/` only when they document a current resource that needs its own preview.
