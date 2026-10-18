"""Package an SDK PBW for release without changing executable payloads."""

import argparse
import json
import os
from pathlib import Path
import tempfile
import zipfile


SOURCE_MAP = "pebble-js-app.js.map"


def package_release(source, destination):
    """Keep debug data beside the compressed PBW; verify every retained entry."""
    source = Path(source)
    destination = Path(destination)
    if source.resolve() == destination.resolve():
        raise ValueError("Release output must differ from the SDK bundle")
    with zipfile.ZipFile(source) as original:
        names = original.namelist()
        if len(names) != len(set(names)):
            raise ValueError("Duplicate bundle entries")
        for required in ("appinfo.json", "pebble-js-app.js", SOURCE_MAP):
            if required not in names:
                raise ValueError(f"Missing SDK bundle entry: {required}")
        appinfo = json.loads(original.read("appinfo.json"))
        resources = appinfo.get("resources") if isinstance(appinfo, dict) else None
        if not isinstance(resources, dict) or not isinstance(resources.get("media"), list):
            raise ValueError("SDK bundle appinfo.json must declare resources.media")
        # Read everything before publishing, including ZIP CRC validation.
        entries = [(info, original.read(info)) for info in original.infolist()]
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as file:
            temporary = Path(file.name)
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED,
                             compresslevel=9) as release:
            for info, data in entries:
                if info.filename != SOURCE_MAP:
                    info.compress_type = zipfile.ZIP_DEFLATED
                    release.writestr(info, data, compresslevel=9)
        with zipfile.ZipFile(temporary) as release:
            for info, data in entries:
                if info.filename != SOURCE_MAP and release.read(info.filename) != data:
                    raise ValueError(f"Changed bundle entry: {info.filename}")
        debug_map = destination.with_suffix(".js.map")
        debug_map.write_bytes(dict((info.filename, data) for info, data in entries)[SOURCE_MAP])
        os.replace(temporary, destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return destination.stat().st_size


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", nargs="?", default="build/pebble-codex-usage.pbw")
    parser.add_argument("destination", nargs="?", default="dist/codex-limits.pbw")
    args = parser.parse_args()
    size = package_release(args.source, args.destination)
    original_size = Path(args.source).stat().st_size
    print(f"Release: {size:,} bytes (SDK: {original_size:,}; "
          f"reduction: {100 * (1 - size / original_size):.1f}%)")


if __name__ == "__main__":
    main()
