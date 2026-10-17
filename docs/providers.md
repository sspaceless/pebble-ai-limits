# Provider setup

[Back to the app overview](../README.md). Account and connection changes are saved with **Save and close**.

## Display and access

**API caps are not remaining quota.** Those views display absolute values such as `4K` and `10M`, their units, and explicit cap labels. No percentage or reset timestamp is invented. The app never generates model responses to discover response headers.

Claude's organization API returns configured limits and requires suitable organization credentials. Individual/workspace-scoped keys may not have access. [Claude Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api).

Gemini API limits apply to a Google Cloud project. An AI Studio API key alone cannot read project quota configuration through Service Usage; OAuth and `serviceusage.quotas.get` permission are required. [Service Usage quota API](https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services.consumerQuotaMetrics/list).

Gemini CLI quotas are for Gemini CLI / Code Assist, not the Gemini website's chat subscription counters. Codex, Claude subscription, and Gemini CLI use internal endpoints whose availability can change.

## Accounts and settings

The watch shows the provider and profile name. When there is only one account, its local profile name is hidden; the provider and available plan remain visible. Codex shows the percentage remaining, matching its usage allowance display. Claude subscription and Gemini CLI show the percentage used, matching their native usage displays. Their bars follow the same direction as their percentages. API connections show configured request/token caps in native units, not invented usage percentages. When explicit plan metadata is available, the header includes it, for example **Codex Plus** or **Claude Max**. Codex reads its usage response or login claims; Claude can use imported subscription metadata; Gemini can use the tier name returned during project discovery. API quotas do not imply a subscription plan, and unknown plans are omitted. Account identity is tracked separately from provider identity, so switching between two Codex or Claude accounts also clears the previous account's values. Cached data for the selected profile can appear immediately with its original timestamp while a fresh request runs. See [provider support](../README.md#provider-support) and [sources](#sources) for the display rules and provider references.

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

## Sources

- [OpenAI Codex login source](https://github.com/openai/codex/blob/main/codex-rs/login/src/device_code_auth.rs)
- [Claude Code statusline quota schema](https://code.claude.com/docs/en/statusline)
- [Claude Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api)
- [Official Claude Code npm package](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- [Gemini CLI quota documentation](https://geminicli.com/docs/resources/quota-and-pricing/)
- [Gemini CLI source](https://github.com/google-gemini/gemini-cli)
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google Service Usage quota schema](https://docs.cloud.google.com/service-usage/docs/reference/rest/v1beta1/services.consumerQuotaMetrics.limits)

Provider icon sources are documented in [`assets/BRANDS.md`](../assets/BRANDS.md). The SVG files in `assets/` are the canonical source for phone settings; after changing one, run `npm run generate:icons` to refresh `src/pkjs/resources/provider-svg.js`. Watch marks are drawn in `src/c/ui/icons.c`; the Codex cloud mark gets a blue-violet color treatment on color displays and a black-and-white treatment on monochrome displays.
