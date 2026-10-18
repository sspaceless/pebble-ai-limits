# Project structure

## Watch app (`src/c`)

- `main.c` owns the window, mutable state, messages, persisted cache, button navigation, and request/retry timers. Its draw callback passes the current state to the view.
- `ui/watch_animation.c` owns bar easing and sync rotation, their timers, and stale-callback generations. Bind it to the loaded layer and deinitialize it before destroying the layer.
- `model/providers.h` names the provider IDs shared with the phone protocol. Their numbers must remain stable.
- `model/snapshot.c` applies partial incoming dictionaries without storage, timers, or drawing. The controller reacts to its account-change result.
- `model/snapshot.h` defines quota and account snapshots. Field order and sizes are part of the persisted cache layout; changes require considering cache migration. It also computes the displayed percentage for both the renderer and bar-animation policy.
- `ui/quota_view.c` lays out the header, quota rows, countdowns, and footer. It reads a const snapshot and explicit connection, status, animation-progress, and rotation inputs. It does not write storage, send messages, or schedule timers.
- `ui/icons.c` owns the Gemini and synchronization drawing paths and draws provider marks. Window load/unload calls `icons_init`/`icons_deinit`; drawing receives the provider or rotation angle explicitly.

`model/` contains snapshot data and decoding; `ui/` contains drawing and animation. `main.c` coordinates both. Headers within a folder use local includes; UI headers reference model headers explicitly through `../model/`.

The SDK build discovers C sources recursively through `wscript`. Keep rendering independent of controller globals so layout changes do not require changing message or account handling.

## Phone companion (`src/pkjs`)

```text
index.js                  Pebble event composition and navigation
accounts.js               Profile repository facade
accounts/                 Storage, migration, records, queries, profiles,
                          ordering, credentials, and atomic settings commits
device-login-policy.js    Pure login-expiry policy shared by the companion and WebView
auth/                     JWT claim decoding (metadata only, no signature verification)
companion/                Refresh jobs, device-login coordination, settings actions,
                          watch identity, delivery queue, quota messages, and error text
providers.js              Provider dispatch facade
providers/                Provider requests, credential import, OAuth, and catalog
  codex/                  Codex login, renewal, session parsing, transport, and quota
  parsers/                Pure non-Codex response normalization
network/                  Shared JSON transport and cancellation groups
validation/               Rules shared by companion and serialized WebView modules
config.js                 Configuration-page facade
settings/                 Browser factories, serialization, markup, and page composition
  pages/                  Account list, name, credentials, and device-code pages
resources/                Explicit module-local views of named canonical values
  shared/                 Actions, DOM identifiers, endpoints, errors, events, HTTP,
                          limits, markup, patterns, plans, providers, quota, storage,
                          styles, syntax, and text
  provider-svg.js         Generated SVG data; contains no rendering logic
```

`index.js` composes operations rather than implementing provider requests or settings commands. `accounts.js` presents one repository interface; its modules share the same storage and migration contract. `accounts/settings.js` validates the entire draft before one write, preserving renewed credentials unless the draft explicitly replaces them.

Watch identity fields, delivery coalescing, quota serialization, and error mapping have separate modules. Refresh jobs and pending device login remain bound to account IDs and revisions. Switching the selected account does not discard rotated credentials or let late responses restore deleted accounts.

Each provider owns its endpoints. Response parsers have no network or storage side effects. Shared HTTP has no provider dependencies. Codex exposes a small adapter interface backed by separate login, renewal, session, quota, and transport modules. Provider catalog order remains part of the C/JS provider-ID protocol.

Settings have two execution environments: companion page composition and the browser WebView. Account list rendering, name editing, provider selection, connection fields, connection validation, connection draft handling, menus, clipboard, drag ordering, and device login are browser modules. `settings/runtime.js` coordinates their shared draft and final save. Switching the connection editor to another account stops the active device login and restores the previous account's connection state from when its editor opened, discarding edits from that open editor. Changes already staged with Save connection remain in the settings draft until Save and close commits them. The clipboard runtime is shared by the inline editor and the standalone device-code page. Device-code expiry is calculated through `device-login-policy.js` in both the companion and WebView; network requests, timers, and DOM updates remain in their respective adapters. `settings/serialize.js` embeds factories and escaped JSON; factories that need resource constants declare `.constants`, and other browser modules are passed explicitly without capturing companion storage. Shared name validation uses this same mechanism.

`provider-icons.js` exposes the icon interface; `settings/provider-icon.js` renders marks. `tools/generate-provider-icons.mjs` only refreshes the SVG data in `resources/provider-svg.js` from canonical assets. All runtime code remains ES5-compatible.

## JavaScript constants policy

ESLint uses only built-in rules: `no-magic-numbers` for numeric policy and declaratively configured `no-restricted-syntax` for application strings, regex literals, and dependency ordering. Resource declarations under `src/pkjs/resources/` are exempt. Browser modules are checked as ordinary source files, including scripts previously hidden inside string literals. There are no local rule implementations or custom plugins. As with the standard numeric rule, named numeric declarations are allowed; project policy still places shared application values in resources.

Canonical definitions live under `resources/shared/`, grouped by responsibility. Module-local resource views expose only values referenced by that module. Runtime code imports its view as `C`. When adding a constant, define it in the appropriate shared catalog, expose it through the module's view, and use a semantic name at the call site. Distinct concepts keep distinct names even if their current values coincide, such as milliseconds per second and compact thousands, or a quota sentinel and an array search result.

Structural literals remain inline: `0` and `1` for initialization, indexing, increments and wire booleans; the conventional `-1` array-search result; an empty string; `typeof` tags; CommonJS import paths; and noncomputed schema property names. Booleans and `null` are language values. Application sentinels, limits, endpoints, statuses, actions, DOM IDs, validation patterns and UI copy use named resources. HTML/CSS and SVG declarations live in resources, with shared name limits, login URLs and action IDs composed from their canonical definitions.

Browser factories that use resource constants declare `module.exports.constants = C` and receive other browser modules as explicit arguments. The serializer restores declared constants in the browser's scope and escapes JSON without changing its contents. It never assumes CommonJS imports or companion state exist in the WebView.

## Validation

Run `npm run check` for JavaScript/C linting, exact formatting, and tests. Run `.venv/bin/pebble build` to compile and link watch modules for all seven configured platforms. Companion integration tests load nested CommonJS modules relative to each importing file and cover account isolation, renewal, login, and settings commits. Focused tests exercise account-editor switching and cancellation, WebView login expiry, clipboard success and fallback, canonical resource completeness, browser escaping, shared validation, and the constants lint policy. JavaScript tests do not execute the C renderer; layout changes also require emulator or device inspection.

## Commit gate

Husky is a pinned development dependency. The npm `prepare` lifecycle installs the repository's hooks via the standard `husky` command. `.husky/pre-commit` delegates to the existing `npm run check` interface, so local commits share the same lint/format/test checks as manual verification. Failures propagate to Git; no fix/stage mutations or duplicate check lists are embedded in the hook. Python lint/format tools must be installed before committing. The SDK build remains separate. Local hooks are not a substitute for required CI checks and protected branches.

## JavaScript utility documentation

Utility functions use JSDoc for parameter/return types and contracts that names alone cannot express: timestamp units, unavailable values, fallback behavior, mutations, thrown errors, and asynchronous completion/cancellation. Shared quota shapes are documented in `providers/quota.js`. Browser serialization documents its separate execution environment and explicit constant dependencies. Keep these contracts current when behavior changes; do not use comments as a substitute for validation or token-signature verification.

## JavaScript lint and layout

ESLint checks shadowed variables, reassigned parameters, unsafe loop closures, callback return values, implicit coercion, chained assignments, dynamic code execution, prototype mutation, and other correctness hazards. Unused suppression comments are errors. Each variable has its own declaration. The Pebble runtime remains ES5; Node tools and tests reject `var`, prefer `const`, and use arrow callbacks where appropriate.

Imports stay grouped. CommonJS dependencies precede local state and implementation. Blank lines separate dependency groups from state, functions from adjacent code, control-flow blocks, returns/throws, and exports. Consecutive imports and related variable declarations may remain together. Public export assignments form a group; their metadata can stay adjacent. The built-in `padding-line-between-statements` rule handles CommonJS groups through `cjs-import` and `cjs-export` statement types and fixes missing blank lines. Dependency ordering is a declarative `no-restricted-syntax` restriction; moving imports remains manual because it can change module initialization order.

`npm run format` applies ESLint fixes first, then Prettier and C formatting. `npm run lint:js:fix` applies only ESLint's safe fixes. `npm run check` verifies the resulting layout and behavior; no formatting or lint failures are ignored.

## C conventions

Document exported functions in headers with Doxygen-style comments (`/** ... */`). Explain units, borrowed/owned pointers, lifecycle requirements, side effects, and non-obvious return values. Private helpers need comments when they explain an invariant or decision beyond the function name. Generating a separate Doxygen website is optional and is not part of the build.

Use module-local enum constants for integer configuration values and shared header constants for protocol IDs or values crossing module boundaries. Retain fixed-width integers in persisted structs. Keep pixel-art geometry local to its drawing data instead of naming every coordinate. Split modules by responsibility and resource ownership; avoid one-file-per-function decomposition.

## Preview artifacts

`preview/` stores image and animation artifacts alongside its README and agent guidance. Watch captures are grouped by SDK platform under `preview/watches/<platform>/`; phone screenshots use `preview/phone/`, and standalone icon studies may use `preview/icons/` when needed. Missing interaction and animation captures remain documented in the preview README until actual captures exist. Do not commit generated or hand-written HTML demos there. Temporary browser-rendering HTML belongs outside the repository. Use screenshots of the current settings renderer or emulator for new previews. The six phone PNGs use demo data: two show the account list, while four show account-creation, rename, connection, and device-login flows inline on the main settings page; outdated watch artwork and diagnostic captures have been removed. Git ignores `preview/**/*.html` and `preview/**/*.htm` to prevent accidental additions.

Phone previews use a fixed PNG canvas of 500 × 1200 pixels at scale factor 1. `npm run generate:previews:phone` renders all scenarios from current settings code in isolated Chrome/Chromium profiles, checks content overflow and PNG dimensions, and publishes only a complete validated set. Temporary HTML remains outside the repository. Watch captures retain their native platform dimensions.

## Release packaging

`.github/workflows/ci.yml` defines the triggers and job dependency graph. It
calls reusable workflows in `detect-app-changes.yml`, `checks.yml`,
`pebble-build.yml`, and `release.yml` to detect app build changes, run
`npm run check`, build all platforms, package release assets, and publish
releases. Checks run on every main push and pull request. The reusable path
filter gates the Pebble build and release on changes to `src/**`, `wscript`, the
npm manifests, release packaging, or workflow files; documentation, previews,
and canonical assets alone do not build or release the app. npm, pip, the Python
Pebble build environment, and the pinned Pebble SDK 4.33.1 are cached between
runs; the build activates the cached SDK and installs it only on a cache miss.
`package.json` sets the initial version of a release line. On a qualifying main
push, `tools/release-version.py` reads the latest release commit in that line and
increments the patch component; the first release uses the package version.
The build job writes that version into its temporary npm manifests, then checks
the PBW's embedded `versionLabel` before exporting it with the source map and
version metadata. The release job recomputes the version from the source commit
and checks the exported value. After tests and build pass, it commits the updated
npm manifests to `main` with a `Release-Source` marker, then publishes the PBW
and GitHub release tag from that version commit. The tag, asset names, source
manifests, and installed PBW have the same version.
The `0.3.x` release line is intentionally below the legacy `1.5.24` and local
`1.6.0` builds. Compatibility when installing over those builds needs a device
check; otherwise later releases should increase the version for the same app UUID.
Reruns of the same source commit recover its existing release commit or skip an
already published release. A newer app change on `main` supersedes an older
source build; documentation-only changes can remain in the release commit. The
release job pushes its version commit using `GITHUB_TOKEN`, which
does not trigger another workflow run. Repository rules must allow that push;
no provider credentials are required. Bump the package major or minor component
to start a new release line.

`npm run package:release` runs the Python standard-library tool
`tools/package-release.py` against the existing SDK PBW. It produces a deflated
`dist/codex-limits.pbw` containing every SDK entry except the companion source map,
which is retained as `dist/codex-limits.js.map`. Runtime JavaScript, platform
binaries, resources, manifests, and checksums are unchanged. The SDK output is
never overwritten; rebuild it before packaging. Packaging validates ZIP CRCs and
compares retained entry bytes before replacing the release PBW. The app metadata
declares `resources.media` even when empty, which the Pebble mobile app requires
when parsing a sideloaded PBW. Packaging rejects bundles missing that field. Tests cover all
seven platform payloads, repeatability, and rejection of incomplete input.
