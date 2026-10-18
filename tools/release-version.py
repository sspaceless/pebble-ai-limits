"""Choose the next PBW version from package.json and release commits in history."""

import json
from pathlib import Path
import re
import subprocess


VERSION = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")
RELEASE_SUBJECT = re.compile(r"^chore\(release\): v(\d+)\.(\d+)\.(\d+)$")


def next_release_version(package_version, subjects):
    """Use the package version for a new line, then increment each released patch."""
    match = VERSION.fullmatch(package_version)
    if match is None:
        raise ValueError(f"Invalid package version: {package_version}")
    major, minor, patch = map(int, match.groups())
    for subject in subjects:
        release = RELEASE_SUBJECT.fullmatch(subject)
        if release is None:
            continue
        released_major, released_minor, released_patch = map(int, release.groups())
        if (released_major, released_minor) == (major, minor):
            patch = max(patch, released_patch + 1)
            break
    if max(major, minor, patch) > 255:
        raise ValueError("Pebble version components must be at most 255")
    return f"{major}.{minor}.{patch}"


def main():
    package = json.loads(Path("package.json").read_text())
    history = subprocess.check_output(
        ["git", "log", "--format=%s", "HEAD"], text=True
    ).splitlines()
    print(next_release_version(package["version"], history))


if __name__ == "__main__":
    main()
