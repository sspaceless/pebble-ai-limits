# Repository guidance

## Keep documentation current

For every change, check whether `README.md` and the relevant files in `docs/` or `preview/` still describe the resulting behavior, setup, architecture, and verification accurately. Update affected Markdown files in the same change. Preserve claims about checks and device or provider behavior only when supported by actual results.

Before structural changes, read `docs/architecture.md`. When a change adds, removes, or moves a module, changes a module's responsibility or dependencies, alters cross-module data flow or lifecycle, or changes persistence, protocol, serialization, or build structure, update `docs/architecture.md` in the same change. Describe the resulting design and its stable contracts; skip routine implementation details. Review nearby architecture guidance for stale statements while editing.

Before changing validation commands, coverage, or verification status, read `docs/verification.md` and update its matrix in the same change. Keep statuses tied to checks actually run and distinguish automated results from manual device or provider checks.

Before changing user-visible behavior, provider support, or installation and usage instructions, read `README.md` and update affected claims in the same change.

Before adding or changing provider marks, read `assets/BRANDS.md` and follow its source and generation guidance.

## Commit messages

When creating a commit, follow the Conventional Commits rule in `docs/development.md`.
