# Preview images

Previews are grouped by device: watch captures under `watches/<platform>/` and phone settings under `phone/`.

```text
preview/
├── watches/
│   ├── aplite/   Classic / Steel
│   ├── basalt/   Time / Time Steel
│   └── chalk/    Time Round
└── phone/        Account-list and standalone-page screenshots
```

## Watch platforms

| SDK platform | Watch type | Available previews |
| --- | --- | --- |
| `aplite` | Classic / Steel | [Claude and Gemini screenshots](watches/aplite/) |
| `basalt` | Time / Time Steel | [Claude and Gemini screenshots](watches/basalt/) |
| `chalk` | Time Round | [Claude and Gemini screenshots](watches/chalk/) |
| `diorite` | Pebble 2 | Not captured yet |
| `emery` | Time 2 | Not captured yet |
| `flint` | Pebble 2 Duo | Not captured yet |
| `gabbro` | Round 2 | Not captured yet |

The retained watch captures show the current Claude/Gemini marks. Old Codex marks, letter-placeholder provider marks, legacy screens, diagnostic images, and animations containing old artwork have been removed. Current Codex, API-cap and animation captures still need to be produced.

For new platforms, add their first real screenshot under `watches/<SDK platform>/`. Choose the actual emulator/device platform; matching screen dimensions alone is not enough to assign a platform. Use provider names such as `codex.png` and `claude.png`, with descriptive names for interactions and animations.

## Phone screenshots

[`phone/`](phone/) contains seven screenshots generated on 17 October 2026 from page renderers exported by `src/pkjs/config.js`. `settings.png` and `connected.png` show the account list. The other five captures use standalone account-creation, rename, device-code, and Claude API/Gemini connection pages still present in the code. The main settings page now performs these actions inline, so those five captures do not represent its current editing flow. Capturing the inline flows requires updating the generator scenarios first; rerunning the existing command alone will reproduce the standalone pages.

The account-list captures show the normal client-side rendering after selecting a demo profile. Initial and subsequent account-list rendering now both create real nested markup while escaping account labels. All names and the `DEMO-ONLY` login code are demonstration data; no provider authentication was performed.

All phone previews use the same format and canvas: **PNG, 500 × 1200 pixels, scale factor 1**. Pages keep their natural layout at the top of the shared viewport; shorter pages retain the normal page background below their content. Captures are not stretched or cropped.

Regenerate the complete set from the current renderer with:

```sh
npm run generate:previews:phone
```

The command requires Chrome/Chromium; set `CHROME_BIN` if its executable is not detected automatically. Temporary HTML and isolated browser profiles stay outside the repository. Generation checks page overflow and PNG dimensions before replacing any output files. If a future page exceeds the viewport, change the shared `SIZE` in `tools/generate-phone-previews.mjs` and regenerate every phone preview together.

These screenshots replace the archived HTML-demo captures. Regenerate them when the UI changes.

## Artifact policy

Preview artifacts must be images (PNG, WebP, or JPEG) or animations (GIF). Do not add saved HTML demos. Keep temporary rendering HTML outside the repository. Capture current watch UI through the appropriate Pebble emulator or device. Store standalone icon studies under `icons/` only when they document a current resource that needs its own preview.
