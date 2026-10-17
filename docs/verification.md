# Verification matrix

This document records what the repository can verify automatically and which checks still need provider accounts, a phone, or a watch. Update the status when a check is run; screenshots and simulated data are not evidence of a live provider integration.

## Automated and build checks

| Area | Check | Status | Coverage and limits |
| --- | --- | --- | --- |
| JavaScript, C lint, formatting, and tests | `npm run check` | Passing on 18 October 2026 (68 tests) | Tests cover companion account isolation and settings flows, serialized WebView login and expiry, clipboard fallback, resource serialization, and provider parsing. Profile-query tests also enforce one storage load per operation and no profile read when acknowledging an empty delivery queue. JavaScript tests do not execute the C renderer. |
| Pebble app compilation | `.venv/bin/pebble build` | Passing on 18 October 2026 | Compiles and links all seven configured platforms: aplite, basalt, chalk, diorite, emery, flint, and gabbro. A successful build does not verify behavior on hardware. |
| Quota display and watch animation | C lint and SDK build | Compiles; visual behavior not verified on device | The shared displayed-percentage policy is in `src/c/model/snapshot.h`. No automated test currently drives the watch renderer or animation timers. |
| Browser settings rendering | Settings and serialization tests | Passing | Tests check initial account-button structure, escaped labels, generated script syntax, and WebView flows. Existing screenshots cover the account list and standalone pages, not the main inline editing flow. |
| Release packaging | `npm run package:release` and packaging regression test | Passing on 18 October 2026 | Actual SDK bundle: 603,323 → 88,901 bytes. Retained entries are compared byte for byte; ZIP CRCs, seven-platform fixtures, separate source map, repeatability, and invalid-input rejection are tested. Mobile installation of the compressed PBW is not yet verified. |
| GitHub Actions CI and release publishing | `.github/workflows/ci.yml` | Configured; remote run pending | Separate test and build jobs run in parallel for pushes to `main` and pull requests. Main pushes then use package and release jobs. npm, pip, and Pebble SDK 4.33.1 are cached. Release versions use the `package.json` major/minor and commit count; reruns reuse the same version and skip duplicate publication. Pull requests do not publish. A successful GitHub Actions run is still needed to verify the hosted environment and release upload. |
| Fresh-checkout setup | README environment creation, dependency installation, and package-copy instructions | Not exercised in a clean environment | The check and build results above use the existing local environment. Fresh setup also requires a separately installed Pebble SDK. |

## Provider and device checks

| Provider or environment | Status | Next useful verification |
| --- | --- | --- |
| Codex | README records a successful real-account check. The architecture audit itself did not use a live provider account. | Recheck device login, approval expiry, token exchange, and usage refresh when changing those flows. |
| Gemini CLI | The available local account returned HTTP 403 `SUBSCRIPTION_REQUIRED`; it could not verify live quota retrieval. | Repeat `npm run check:gemini` with an eligible account. |
| Claude and API providers | Automated parsing and normalization tests pass; provider adapters still need account-specific device checks. | Verify authentication, quota responses, and displayed caps/percentages with eligible accounts. |
| Physical phone (iOS 27) | Login, credential import, and background behavior have not been verified on a physical phone. | Exercise those flows on a device, including returning from the provider approval page. |
| Physical watch | The current audit did not use a physical watch. | Check account switching, unavailable quotas, full-consumption bars, sync animation, and layout on representative hardware. |

## Preview coverage

All seven phone PNGs were checked to be 500 × 1200 pixels on 18 October 2026. They use demonstration data and do not verify provider authentication. Two show the account list; five show standalone pages retained in the code. Captures of the main inline account-creation, rename, connection, and device-login flows are still needed. Watch captures show Claude screens on all seven SDK platforms and Gemini screens on aplite, basalt, and chalk; they do not cover Codex, API caps, or current progress/sync animations. The four newly added Claude captures were taken from their matching SDK emulators with demonstration data on 18 October 2026. See [preview/README.md](../preview/README.md) for capture coverage and regeneration instructions.

Run `npm run generate:previews:phone` after settings UI changes. Capture watch screenshots from the appropriate emulator or device and record the actual SDK platform in `preview/README.md`.
