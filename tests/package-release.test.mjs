import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('release packaging preserves all runtime entries and externalizes only the source map', () => {
  const result = spawnSync(
    '.venv/bin/python',
    [
      '-c',
      `
import importlib.util
from pathlib import Path
import tempfile
import zipfile

spec = importlib.util.spec_from_file_location('packaging', 'tools/package-release.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    source = root / 'sdk.pbw'
    destination = root / 'dist' / 'release.pbw'
    entries = {
        'appinfo.json': b'{}',
        'pebble-js-app.js': b'var example = 1;\\n' * 1000,
        'pebble-js-app.js.map': b'{"version":3}',
    }
    for platform in ('aplite', 'basalt', 'chalk', 'diorite', 'emery', 'flint', 'gabbro'):
        for name in ('pebble-app.bin', 'app_resources.pbpack', 'manifest.json'):
            entries[platform + '/' + name] = (platform + name).encode() * 100
    with zipfile.ZipFile(source, 'w') as archive:
        for name, data in entries.items():
            archive.writestr(name, data)
    original = source.read_bytes()
    module.package_release(source, destination)
    first = destination.read_bytes()
    assert source.read_bytes() == original
    assert len(first) < len(original)
    assert destination.with_suffix('.js.map').read_bytes() == entries[module.SOURCE_MAP]
    with zipfile.ZipFile(destination) as archive:
        assert set(archive.namelist()) == set(entries) - {module.SOURCE_MAP}
        assert archive.testzip() is None
        for info in archive.infolist():
            assert archive.read(info) == entries[info.filename]
            assert info.compress_type == zipfile.ZIP_DEFLATED
    module.package_release(source, destination)
    assert destination.read_bytes() == first
    try:
        module.package_release(source, source)
        raise AssertionError('Overwrote SDK bundle')
    except ValueError:
        pass
    with zipfile.ZipFile(source, 'w') as archive:
        archive.writestr('appinfo.json', b'{}')
    try:
        module.package_release(source, destination)
        raise AssertionError('Accepted incomplete bundle')
    except ValueError:
        pass
    assert destination.read_bytes() == first
`
    ],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
