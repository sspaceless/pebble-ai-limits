# Preview work

Store watch captures under `watches/<SDK platform>/`, phone settings screenshots under `phone/`, and standalone icon studies under `icons/`.

Phone previews must be PNG at exactly 500 × 1200 pixels; regenerate the whole set with `npm run generate:previews:phone`. Watch previews keep their native platform dimensions and may use PNG, WebP, JPEG, or GIF. Do not add saved HTML demos; keep temporary rendering HTML outside the repository.

Choose watch platforms from capture metadata or documented provenance. Matching screen dimensions alone is not enough to assign a platform.

Create new screenshots from the current settings renderer or the appropriate Pebble emulator/device. When working with existing previews, read [README.md](README.md) for platform coverage and capture provenance.

After changing preview coverage, provenance, or regeneration steps, update this folder's `README.md` and any affected screenshot links or claims in the project `README.md`.
