# Tooling guidance

- Follow the package scripts in `package.json` and keep Node tools compatible with the declared Node.js engine range.
- Keep `check-direct.mjs` and `check-gemini.mjs` read-only: never print or persist credentials, and report sanitized errors rather than raw responses.
- Keep generators tied to canonical inputs. Edit provider SVGs in `assets/` and regenerate `src/pkjs/resources/provider-svg.js` with `npm run generate:icons`; do not hand-edit generated output.
- The phone-preview generator must use demonstration data, validate every capture before publishing the set, and keep temporary HTML/browser profiles outside the repository.
- Treat `format-c.mjs` without `--write` as a check; use `--write` only when intentionally formatting C sources.
- When tooling commands, setup, release packaging, or preview generation changes, update the affected guidance in `docs/development.md`, `docs/verification.md`, or `preview/README.md`.
