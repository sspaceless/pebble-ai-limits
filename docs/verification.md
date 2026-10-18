# Verification matrix

This document records what the repository can verify automatically and which checks still need provider accounts, a phone, or a watch. Update the status when a check is run; screenshots and simulated data are not evidence of a live provider integration.

## Automated and build checks

| Area | Check | Status | Coverage and limits |
| --- | --- | --- | --- |
| JavaScript, C lint, formatting, and tests | `npm run check` | Passing on 18 October 2026 (70 tests) | Tests cover companion account isolation and settings flows, serialized WebView login and expiry, clipboard fallback, resource serialization, provider parsing, sequential release versions, and rerun stability. JavaScript tests do not execute the C renderer. |
| Pebble app compilation | `.venv/bin/pebble clean` then `.venv/bin/pebble build` | Passing on 18 October 2026 with package version 0.3.0 | Compiles and links all seven configured platforms: aplite, basalt, chalk, diorite, emery, flint, and gabbro. The resulting PBW reports version 0.3.0 and contains `resources.media: []`. A successful build does not verify installation on hardware. |
| Quota display and watch animation | C lint and SDK build | Compiles; visual behavior not verified on device | The shared displayed-percentage policy is in `src/c/model/snapshot.h`. No automated test currently drives the watch renderer or animation timers. |
| Browser settings rendering | Settings and serialization tests; `npm run generate:previews:phone` | Passing on 18 October 2026 | Tests check initial account-button structure, escaped labels, generated script syntax, and WebView flows. The screenshot generator checks overflow and exact 500 × 1200 PNG dimensions for account-list, inline account-creation, rename, connection, and device-login captures. |
| Release packaging | `npm run package:release` and packaging regression test | Passing on 18 October 2026 | Actual 0.3.0 SDK bundle: 603,366 → 88,901 bytes. Retained entries, ZIP CRCs, seven-platform fixtures, separate source map, repeatability, and rejection of missing `resources.media` are tested. An earlier corrected compressed local 1.6.0 PBW installed on one Pebble Classic through Pebble for iPhone 1.15.0.1; the 0.3.0 and hosted CI releases have not been checked on a device. |
| GitHub Actions CI and release publishing | `.github/workflows/ci.yml` plus reusable workflows | Configured; remote run pending | Checks run on pushes to `main` and pull requests. A path filter gates the seven-platform build and release on app source, build manifests, release packaging, or workflow changes; Markdown, canonical assets, and previews alone skip the build and release. Main pushes publish after checks and build pass. npm, pip, the Pebble build environment, and SDK 4.33.1 are cached. The first release uses the package version; later releases increment the patch, write it back in a CI commit, and use it in the PBW and GitHub tag. Reruns recover or skip the same release. Pull requests do not publish. The bot push, hosted build, and release upload still need a successful GitHub Actions run. |
| Fresh-checkout setup | [Development guide](development.md) environment creation, dependency installation, and package-copy instructions | Not exercised in a clean environment | The check and build results above use the existing local environment. Fresh setup also requires a separately installed Pebble SDK. |

## Provider and device checks

| Provider or environment | Status | Next useful verification |
| --- | --- | --- |
| Codex | A successful real-account check was previously recorded in the README. The architecture audit itself did not use a live provider account. | Recheck device login, approval expiry, token exchange, and usage refresh when changing those flows. |
| Gemini CLI | The available local account returned HTTP 403 `SUBSCRIPTION_REQUIRED`; it could not verify live quota retrieval. | Repeat `npm run check:gemini` with an eligible account. |
| Claude and API providers | Automated parsing and normalization tests pass; provider adapters still need account-specific device checks. | Verify authentication, quota responses, and displayed caps/percentages with eligible accounts. |
| Physical iPhone | User confirmed that the corrected local compressed 1.6.0 test PBW installed through Pebble 1.15.0.1 on a Classic with firmware 3.13. Previous PBWs without `resources.media` failed with `Error while sideloading app`. The iOS version was not provided; 0.3.0 installation, login, credential import, and background behavior remain unverified. | Check the 0.3.0 PBW, including installation over a higher-version build, then exercise account flows on a device. |
| Physical watch | The current audit did not use a physical watch. | Check account switching, unavailable quotas, full-consumption bars, sync animation, and layout on representative hardware. |

## Preview coverage

All six phone PNGs were generated at 500 × 1200 pixels on 18 October 2026. They use demonstration data and do not verify provider authentication. Two show the account list; four show inline account-creation, rename, connection, and device-login flows on the main settings page. Watch captures cover all six provider types on all seven SDK platforms, taken from their matching emulators with demonstration data on 18 October 2026. They do not verify provider authentication, physical hardware behavior, or current progress/sync animations. See [preview/README.md](../preview/README.md) for capture coverage and regeneration instructions.

Run `npm run generate:previews:phone` after settings UI changes. Capture watch screenshots from the appropriate emulator or device and record the actual SDK platform in `preview/README.md`.
