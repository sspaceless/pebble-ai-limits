# TODO

## P1 — Code quality

- [x] Add suitable linters and enforce strict formatting rules for C and JavaScript.
  - [x] Enforce stricter JS correctness checks, one declaration per variable, grouped dependencies, and blank lines between logical blocks.
  - [x] Use built-in ESLint rules and declarative configuration; remove local rule implementations.
- [x] Restructure the project to make it easier to maintain.
  - [x] Separate watch rendering, icon resources, and persisted snapshot types from the app controller.
  - [x] Group watch data modules under `model/` and rendering/animation modules under `ui/`.
  - [x] Review companion module boundaries and document remaining ownership changes.
- [x] Break the code into clearer, more independent modules.
  - [x] Extract `quota_view` and `icons` with explicit rendering inputs and resource lifecycle.
  - [x] Extract watch animation ownership and side-effect-free snapshot decoding.
  - [x] Name protocol IDs and timing/progress constants; document public C contracts.
  - [x] Extract companion messaging, refresh jobs, device login, shared HTTP, and provider adapters.
  - [x] Separate inline WebView login; keep draft edits and atomic save in one settings coordinator.
  - [x] Decompose account storage/migration/operations, Codex sessions/login/quota, provider parsers, watch delivery, and settings browser modules.
  - [x] Extract application strings, numbers, patterns, UI templates, and styles into named resources with explicit per-module dependencies.
  - [x] Enforce the JS constants policy in ESLint and test browser resource serialization and shared validation.
- [x] Review performance and optimize bottlenecks.
  - [x] Remove repeated profile-store parsing and empty-outbox reads; record scope and operation counts in [performance review](performance.md).

## P2 — Development foundation

- [x] Install Husky pre-commit hooks that require ESLint, C lint, formatting checks, and tests to pass.

- [x] Set up CI to build the Pebble app, run tests, and publish release artifacts to GitHub Releases, starting release versions at `0.*.*`.
- [x] Add `AGENTS.md` and supporting files with project guidance for AI agents.

## P3 — Project presentation and resources

- [x] Replace saved HTML demos in `preview/` with PNG screenshots and keep future preview artifacts image-only.
- [x] Organize watch previews by SDK platform; separate phone screenshots and icon studies.
- [x] Standardize all phone previews as 500 × 1200 PNGs with a repeatable, overflow-checked generator.

- [ ] Prepare all required metadata and assets for the Pebble Store listing.
- [x] Document development checks and build instructions in the README.
- [ ] Add an embedded project preview to the GitHub README.
- [ ] Update the phone-preview generator to capture the main settings page's inline account-creation, rename, connection, and device-login flows, then regenerate the screenshots.
- [ ] Capture current Codex and API-cap screens and animations; add `diorite`, `emery`, `flint`, and `gabbro` previews. Existing watch previews cover Claude/Gemini on `aplite`, `basalt`, and `chalk`.
- [x] Remove obsolete preview assets and old icon studies; regenerate phone previews and fix stale paths in `assets/BRANDS.md`.
