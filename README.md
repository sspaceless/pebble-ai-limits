# AI Limits for Pebble

A native watch app for **Codex, Claude, Gemini CLI, Claude API, Gemini API, and custom providers**. It shows subscription quota percentages and reset countdowns, or configured API caps with their units. The white screen retains compact typography, provider marks, and a filled synchronization icon.

The app runs through the paired phone. Multiple named accounts are supported for every provider. Each profile stores its own credentials and cached quota snapshot. Existing single-account connections migrate automatically to profiles named Personal; the app keeps its original UUID and is now listed as **AI Limits**.

## Provider support

| Connection | Display | Credentials |
| --- | --- | --- |
| Codex | Remaining primary/secondary percentages and reset times | Built-in ChatGPT device-code login |
| Claude subscription / Claude Code | Remaining five-hour/seven-day percentages and reset times | Claude Code OAuth token or credentials JSON |
| Gemini CLI | Remaining quotas for two model IDs and their reported reset times | Gemini CLI OAuth JSON; Code Assist project is discovered automatically |
| Claude API | Configured requests/min and input tokens/min caps | An Anthropic key authorized for the organization Rate Limits API, plus a model ID |
| Gemini API | Configured requests/min and requests/day caps | Google Cloud OAuth, project number, quota metric, and model dimension |
| Custom | Remaining percentages and resets from a trusted HTTPS JSON endpoint | Optional bearer token |

**API caps are not remaining quota.** Those views display absolute values such as `4K` and `10M`, their units, and explicit cap labels. No percentage or reset timestamp is invented. The app never generates model responses to discover response headers.

Claude's organization API returns configured limits and requires suitable organization credentials. Individual/workspace-scoped keys may not have access. [Claude Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api).

Gemini API limits apply to a Google Cloud project. An AI Studio API key alone cannot read project quota configuration through Service Usage; OAuth and `serviceusage.quotas.get` permission are required. [Service Usage quota API](https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services.consumerQuotaMetrics/list).

Gemini CLI quotas are for Gemini CLI / Code Assist, not the Gemini website's chat subscription counters. Codex, Claude subscription, and Gemini CLI use internal endpoints whose availability can change.

## Install and connect

1. Install the current [Pebble mobile app](https://repebble.com/app) and pair your watch.
2. Download the latest `ai-limits-*.pbw` from the [GitHub Releases](https://github.com/sspaceless/pebble-ai-limits/releases) page, then transfer it to your iPhone using AirDrop or Files, open or share it with Pebble, and install it from the locker. Install over the existing version when upgrading. To build from source, use [Building and testing](#building-and-testing).
3. Open **AI Limits** settings, tap an account to select it, or expand **+ Add account**, select a connection type, and name the account.
4. Connect the account using the instructions below.
5. Open the app on the watch. **UP / DOWN** cycles through every account in the saved order, including accounts that are not connected yet; **SELECT** refreshes the active account.

The watch shows the provider and profile name. When there is only one account, its local profile name is hidden; the provider and available plan remain visible. Codex shows the percentage remaining, matching its usage allowance display. Claude subscription and Gemini CLI show the percentage used, matching their native usage displays. Their bars follow the same direction as their percentages. API connections show configured request/token caps in native units, not invented usage percentages. When explicit plan metadata is available, the header includes it, for example **Codex Plus** or **Claude Max**. Codex reads its usage response or login claims; Claude can use imported subscription metadata; Gemini can use the tier name returned during project discovery. API quotas do not imply a subscription plan, and unknown plans are omitted. Account identity is tracked separately from provider identity, so switching between two Codex or Claude accounts also clears the previous account's values. Cached data for the selected profile can appear immediately with its original timestamp while a fresh request runs. See [provider support](#provider-support) and [sources](#sources) for the display rules and provider references.

In the account list, drag the handles with a mouse or finger, then tap **Save and close**. You can mix providers in any order. Keyboard users can focus a handle and use Arrow Up / Arrow Down. Use the **⋯** menu beside an account to reconnect, rename, or remove it. This order drives UP / DOWN on the watch.

Account setup and provider credentials appear inline in settings. **Cancel** closes the active form and keeps settings open. **Save connection** stages credentials; **Save and close** commits account, order, and credential changes together. Codex device sign-in also happens inline: start sign-in, copy the one-time code, approve it in Safari, then save the connected account. Cancelling stops the login and keeps settings open.

**Rename account** changes its display name without changing credentials. **Update credentials** reconnects only that profile. **Remove account** deletes only that profile's credentials and cached values; other profiles remain connected. There is no fixed one-account-per-provider limit.

Token renewal can finish after you switch away: rotated tokens are saved to their original profile. Late responses cannot overwrite a reconnected account or restore a deleted account. Codex device-code login is bound to its target profile, even if you switch to another profile while approval is pending. Only one device-code login is pending at a time; starting another replaces that pending attempt, without deleting connected accounts.

## Codex

In settings, choose **Sign in with ChatGPT**. The one-time code appears inline; copy it, open `https://auth.openai.com/codex/device` in Safari, and approve the sign-in. Return to settings and tap **Save and close** to store the connected account. Cancelling the inline flow leaves the settings page open.

Each Codex profile gets its own phone session. Before approving a code, choose the intended ChatGPT account on the OpenAI page; naming a profile Work does not switch your browser account automatically. Tokens are renewed when needed. No computer needs to remain running. The authorization screen may identify the OAuth client as Codex.

## Claude subscription

Select **Claude** and paste an OAuth access token or import a Claude Code credentials JSON file:

```json
{
  "claudeAiOauth": {
    "accessToken": "YOUR_ACCESS_TOKEN",
    "refreshToken": "YOUR_REFRESH_TOKEN",
    "expiresAt": 2000000000000
  }
}
```

`expiresAt` is milliseconds since the Unix epoch. Claude Code may store credentials in `~/.claude/.credentials.json` or the OS credential store. No credentials are extracted or exported automatically. Transfer a credentials file privately; never commit it to this repository. Refresh tokens enable automatic renewal; an access token alone requires replacement after expiry. Imported refresh credentials can share a session with your CLI, so refresh rotation can require signing in again there.

The adapter reads `https://api.anthropic.com/api/oauth/usage` with the OAuth beta header. It supports both the endpoint's `utilization`/ISO reset format and Claude Code's `used_percentage`/Unix reset format. This is not a built-in Claude browser login.

## Gemini CLI

Select **Gemini CLI** and import `~/.gemini/oauth_creds.json` privately, or paste a token. The JSON typically contains `access_token`, `refresh_token`, and `expiry_date` (milliseconds).

The Code Assist project is discovered automatically with a read-only health check. Optionally enter the **Code Assist project ID** used by your Gemini CLI account to override discovery; do not enter an arbitrary API project. Model ID fields are optional: enter exact IDs to pin two models, or leave them blank to display the first two returned model IDs in sorted order. The adapter uses the most restrictive reported bucket for each model. Missing models/fractions are shown as unavailable.

The phone calls `https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota` with `{ "project": "YOUR_CODE_ASSIST_PROJECT" }`. OAuth renewal uses the public installed-app client from Google's open-source Gemini CLI unless you provide your own client ID and secret. Access depends on your Google account's Code Assist entitlement and permissions.

## Claude API

Select **Claude API**, enter a key authorized for the organization Rate Limits API, and an exact model ID. The app makes a read-only request to `/v1/organizations/rate_limits?model=...`, then shows that model group's RPM and input TPM caps. It does not call the Messages API and does not claim to know your current token-bucket balance.

## Gemini API

Select **Gemini API** and provide:

- Google Cloud OAuth credentials JSON or an access token with quota-read permissions. Refresh-only Google application-default credentials JSON is also supported when it contains the OAuth client metadata.
- Your Google Cloud **project number**.
- The exact **quota metric name** shown in Cloud Console, scoped to request counts.
- The exact **model dimension** to select its effective override.

The adapter reads all pages of the Service Usage `consumerQuotaMetrics` response and selects minute/day limits for the requested metric and model. It uses matching model overrides before a global default. Unsupported or ambiguous dimensions are rejected instead of guessing. Values are configured caps; live remaining API usage is not currently available in this view. The app does not infer quotas from a raw API key or make generation requests.

## Custom providers

Select **Custom**, enter a trusted HTTPS URL, an optional bearer token, and a display name. The endpoint must return:

```json
{
  "primary": { "left": 75, "resetsAt": 2000000000, "note": "" },
  "secondary": { "left": 40, "resetsAt": 2000100000, "note": "" },
  "updatedAt": 1999990000
}
```

`left` is a remaining percentage from 0 to 100, or -1 when unavailable. All timestamps are Unix seconds. `updatedAt` must describe the actual source snapshot, not the time a stale response was served. The bearer token is sent only to your selected endpoint. Plain HTTP, URL credentials, and query-string tokens are not accepted.

## Runtime and storage

Supports all seven platforms: Classic / Steel (`aplite`), Time / Time Steel (`basalt`), Time Round (`chalk`), Pebble 2 (`diorite`), Time 2 (`emery`), Pebble 2 Duo (`flint`), and Round 2 (`gabbro`). The interface uses English system fonts for Classic compatibility.

Fresh data requires the paired phone and internet access. Percentage bars animate from empty to their current value over 640 ms when the app opens or fresh data arrives. Cached replay messages do not restart an animation; switching accounts cancels the previous animation. During refresh, a rotating sync icon replaces the Updating text. Gemini uses a colored four-point diamond/star and Claude a pixel crab; monochrome watches use black-and-white versions.

The countdown updates every minute. While the watch app is open, data refreshes every five minutes or when SELECT is pressed. After a reset passes, the watch displays `Awaiting update` until new data arrives.

Tokens are stored in the companion's `localStorage`, not on the watch or in configuration HTML, logs, or source files. This is companion storage, not iOS Keychain. Configuration pages are local `data:` URLs; file import, clipboard behavior, and background execution depend on the iOS companion version. Removing a profile deletes its local credentials but does not revoke the session with its provider.

## Building and testing

Requires Node.js 20.19+, 22.13+, or 24+, Python 3.13, `pebble-tool`, and a separately installed Pebble SDK with all seven target platforms. `.venv/` and `dist/` are local directories excluded from Git.

On a fresh checkout, create the Python environment first (skip this command if `.venv` already exists):

```sh
python3.13 -m venv .venv
```

Install the pinned development tools and the Pebble CLI before running checks. The existing local environment uses `pebble-tool` 5.0.40:

```sh
npm ci
.venv/bin/python -m ensurepip
.venv/bin/python -m pip install -r requirements-dev.txt pebble-tool==5.0.40
```

`npm ci` also installs Husky's Git hooks through the `prepare` script. Before
committing, install the Python development tools above: the pre-commit hook runs
`npm run check` against the current working tree, including ESLint, C lint,
Prettier/clang-format checks, and all tests. Any nonzero exit blocks the commit;
the hook does not auto-fix or stage files. Run `npm run prepare` to reinstall the
hooks if necessary, or `git hook run pre-commit` to check the installed hook
without creating a commit.

These are local checks and can be bypassed by Git options; shared validation
runs in GitHub Actions. Pushes to `main` and pull requests run checks and build
all seven Pebble platforms in separate parallel jobs. The workflow caches npm,
Python packages, and the pinned Pebble SDK between runs. On `main`, a packaging
job prepares the PBW, source map, and SHA-256 checksum; the following publish
job uploads them to [GitHub Releases](https://github.com/sspaceless/pebble-ai-limits/releases)
after the test and build jobs pass. Release versions use `MAJOR.MINOR.N`, based on the
`package.json` version and the Git commit count at the pushed revision. Bump
`package.json` to `0.3.0` or `1.0.0` to start a new minor or major line.
Rerunning CI for the same commit reuses its version and skips an already
published release; pull requests do not publish. Locally, the SDK build remains
a separate check because it requires the full SDK environment.

`npm run check` enforces ESLint rules (including ES5 syntax for PebbleKit JS),
C checks with cpplint, and exact Prettier/clang-format output, then runs the tests.
`npm run format` applies ESLint fixes and formatting; `npm run lint:js:fix` runs the ESLint fixes alone; `npm run lint:js` and `npm run lint:c` run the
language checks separately. C checks focus on braces, multiline comments, and
unsafe runtime calls; SDK compiler warnings remain part of the build check.
The icon generator applies the same Prettier configuration to its output.
Built-in ESLint rules check runtime application strings, magic numbers, and regex patterns;
named values live in `src/pkjs/resources/`. Browser scripts are regular ES5 modules
with explicit serialized constants. See [project architecture and conventions](docs/architecture.md), the [verification matrix](docs/verification.md), and [planned work](docs/TODO.md).

```sh
npm run check
.venv/bin/pebble build
npm run package:release
```

`npm run package:release` creates `dist/codex-limits.pbw` from the existing SDK
bundle using ZIP deflate compression. It preserves all runtime payloads and all
seven platforms byte for byte, and saves the debug source map separately as
`dist/codex-limits.js.map`. Keep that map with the matching release for diagnosis.
The original SDK bundle and build source map remain in `build/`. Always build
before packaging to avoid releasing stale code. The measured package shrank from
589 KiB to 86.8 KiB; future sizes depend on the source. Archive integrity is tested;
installation of the compressed release through the mobile app still needs a
physical-device check. The original SDK PBW remains available for comparison.

If message keys change, regenerate cached SDK output:

```sh
.venv/bin/pebble clean
.venv/bin/pebble build
```

Install using Developer Connection or run the Classic emulator:

```sh
.venv/bin/pebble install dist/codex-limits.pbw --phone PHONE-IP
.venv/bin/pebble install --emulator aplite
```

Read-only live checks using existing local sessions:

```sh
npm run check:direct
npm run check:gemini
```

These checks never print credentials or save them to this repository. The Gemini check refreshes an access token in memory if necessary, then reads account/quota metadata without changing the CLI credential file.

The automated tests cover provider parsing, missing data, model selection, API caps versus remaining quota, Google pagination, OAuth imports/renewal, source timestamps, account isolation, migration, renaming, deletion, independent token rotation, login binding, cancellation, switching during requests, account reordering, staying on the settings page during edits, and atomic settings saves without overwriting renewed credentials. Codex has been checked against a real account. Retained emulator previews cover Claude and Gemini CLI on Classic, Time, and Time Round using simulated data. Current Codex, API-cap, progress-animation, and sync-rotation captures still need to be refreshed. Claude and API-provider adapters require account-specific device testing; the available local Gemini account returned HTTP 403 with `SUBSCRIPTION_REQUIRED` during the live check. This account cannot validate live Gemini quotas; eligible credentials are required. Full iOS 27 login/import and background behavior still require testing on a physical phone.

## Preview assets

[`preview/`](preview/README.md) groups watch screenshots and GIF animations by SDK platform under `watches/`; phone settings screenshots live under `phone/`, with standalone icon studies under `icons/` only when needed. Keep previews as images rather than saved HTML pages. Phone previews use PNG at a fixed 500 × 1200 pixels and demo data. Two show the account list; the other five use standalone page renderers still present in the code, so they do not show the inline editing flow used by the main settings page. Run `npm run generate:previews:phone` to regenerate the full set when the interface changes.

## Sources

- [OpenAI Codex login source](https://github.com/openai/codex/blob/main/codex-rs/login/src/device_code_auth.rs)
- [Claude Code statusline quota schema](https://code.claude.com/docs/en/statusline)
- [Claude Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api)
- [Official Claude Code npm package](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- [Gemini CLI quota documentation](https://geminicli.com/docs/resources/quota-and-pricing/)
- [Gemini CLI source](https://github.com/google-gemini/gemini-cli)
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google Service Usage quota schema](https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services.consumerQuotaMetrics.limits)

Provider icon sources are documented in [`assets/BRANDS.md`](assets/BRANDS.md). The SVG files in `assets/` are the canonical source for phone settings; after changing one, run `npm run generate:icons` to refresh `src/pkjs/resources/provider-svg.js`. Watch marks are drawn in `src/c/ui/icons.c`; the Codex cloud mark gets a blue-violet color treatment on color displays and a black-and-white treatment on monochrome displays.
