# Pebble Store listing draft

This draft is ready to enter in the Pebble Developer Dashboard. The dashboard accepts up to five PNG, JPEG, or GIF screenshots per platform; each screenshot must match that platform's display size. All seven supported platform folders already contain current emulator captures in those dimensions.

## Listing details

| Dashboard field | Value |
| --- | --- |
| App title | AI Limits |
| Category | Tools & Utilities |
| Website URL | https://github.com/sspaceless/pebble-ai-limits |
| Source code URL | https://github.com/sspaceless/pebble-ai-limits |
| Support email | Leave blank to use the developer account email |
| Companion app | None; setup uses the paired Pebble mobile app's app settings |
| Small and large icons | Optional; allow the store to generate these from the app name |
| Marketing banner | Optional; omit for the first listing |

The package UUID, app type, version, and target platforms come from `package.json`. Keep the existing UUID for every release. Build the PBW from the release revision before uploading it.

## Description

The text below is plain text and is 929 characters, under the 1,600-character limit.

```text
AI Limits puts your AI quota status on your Pebble watch. Check subscription usage, configured API caps and reset times at a glance.

Connect Codex, Claude / Claude Code, Gemini CLI, Claude API, Gemini API, or a trusted custom HTTPS quota endpoint. Create multiple named profiles and switch between them with the watch buttons. The companion refreshes data and sends it to the watch; cached values remain visible while an update runs.

Subscription and CLI views show provider-reported remaining or used percentages and reset times. API views show configured request and token caps with their units; they do not claim to show live API consumption. Data refreshes when requested and every five minutes while the watch app is open.

Requires a paired phone with the Pebble mobile app and an internet connection. Credentials are stored in the phone companion's local storage and are sent to the selected provider or custom endpoint.
```

## Screenshot sets

Use these five real emulator captures for every supported SDK platform. Each platform's files are in `preview/watches/<platform>/`; do not resize or frame them.

| SDK platform | Watch models | Screenshot files |
| --- | --- | --- |
| `aplite` | Classic / Steel | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `basalt` | Time / Time Steel | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `chalk` | Time Round | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `diorite` | Pebble 2 | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `emery` | Time 2 | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `flint` | Pebble 2 Duo | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |
| `gabbro` | Round 2 | `codex.png`, `claude.png`, `gemini.png`, `claude-api.png`, `gemini-api.png` |

The custom endpoint is described in the listing but does not fit within the five-screenshot limit alongside the main subscription and API examples. All six provider screens remain available in each preview folder. Captures use demonstration data and do not imply provider endorsement or verify authentication.

## Dashboard handoff checklist

- [ ] Create the watchapp with the title, category, website, and source URLs above.
- [ ] Upload the PBW built from the intended release revision and publish that release.
- [ ] Create one asset collection for each of the seven supported platforms, using its five matching screenshots and the description above.
- [ ] Choose the desired listing visibility and publish the listing.

Icons and a banner are optional in the current submission guide. The store can generate missing icons. This repository contains no store-ready banner, so omit it unless a designed marketing image is added later.

Requirements checked against [Preparing a Submission](https://developer.repebble.com/guides/appstore-publishing/preparing-a-submission/) on 18 October 2026. The listing itself has not been created or published.
