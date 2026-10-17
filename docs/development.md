# Development

[Back to the app overview](../README.md).

## Setup, checks, and releases

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
runs in GitHub Actions. `.github/workflows/ci.yml` orchestrates reusable
change detection, check, Pebble-build, and release workflows. Pushes to `main`
and pull requests always run checks. Changes to app source, build manifests,
release packaging, or workflow files also build all seven Pebble platforms.
Markdown-only changes still run checks but skip the Pebble build and release
publication. Canonical asset and preview changes also skip both. The workflow
caches npm, Python packages, the Pebble build environment, and the
pinned SDK between runs.
For qualifying pushes to `main`, a packaging job prepares the PBW, source map,
and SHA-256 checksum; the following publish job uploads them to [GitHub
Releases](https://github.com/sspaceless/pebble-ai-limits/releases)
after the test and build jobs pass. Release versions use `MAJOR.MINOR.N`, based on the
`package.json` version and the Git commit count at the pushed revision. Bump
`package.json` to `0.3.0` or `1.0.0` to start a new minor or major line.
Rerunning CI for the same commit reuses its version and skips an already
published release; pull requests do not publish. Each release includes a brief
installation guide, the CI commit, GitHub-generated release notes, a list of
commits since the previous release, and a SHA-256 file.
Download all three assets into one directory and run
`sha256sum -c ai-limits-VERSION.sha256` to verify the PBW and sourcemap.
Locally, the SDK build remains a separate check because it requires the full
SDK environment.

`npm run check` enforces ESLint rules (including ES5 syntax for PebbleKit JS),
C checks with cpplint, and exact Prettier/clang-format output, then runs the tests.
`npm run format` applies ESLint fixes and formatting; `npm run lint:js:fix` runs the ESLint fixes alone; `npm run lint:js` and `npm run lint:c` run the
language checks separately. C checks focus on braces, multiline comments, and
unsafe runtime calls; SDK compiler warnings remain part of the build check.
The icon generator applies the same Prettier configuration to its output.
Built-in ESLint rules check runtime application strings, magic numbers, and regex patterns;
named values live in `src/pkjs/resources/`. Browser scripts are regular ES5 modules
with explicit serialized constants. See [project architecture and conventions](architecture.md) and the [verification matrix](verification.md).

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

See the [verification matrix](verification.md) for recorded results and outstanding provider/device checks. See the [preview guide](../preview/README.md) for screenshot coverage and regeneration.
