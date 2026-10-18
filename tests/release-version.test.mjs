import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('release versions start at the package version and increment after a release commit', () => {
  const result = spawnSync(
    '.venv/bin/python',
    [
      '-c',
      `
import importlib.util

spec = importlib.util.spec_from_file_location('release_version', 'tools/release-version.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
choose = module.next_release_version
assert choose('0.3.0', ['Feature change']) == '0.3.0'
assert choose('0.3.0', ['Feature change', 'chore(release): v0.3.0']) == '0.3.1'
assert choose('0.3.0', ['Feature change', 'chore(release): v0.3.1', 'chore(release): v0.3.0']) == '0.3.2'
assert choose('0.4.0', ['chore(release): v0.3.8']) == '0.4.0'
assert choose('0.3.4', ['chore(release): v0.3.1']) == '0.3.4'
try:
    choose('0.3.0', ['chore(release): v0.3.255'])
    raise AssertionError('Accepted a patch above the Pebble limit')
except ValueError:
    pass
`
    ],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('a rerun of the source commit keeps its release version', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ai-limits-release-'));
  const script = resolve('tools/release-version.py');
  const python = resolve('.venv/bin/python');
  const run = (command, args) => {
    const result = spawnSync(command, args, { cwd: directory, encoding: 'utf8' });

    assert.equal(result.status, 0, result.stderr || result.error?.message);

    return result.stdout.trim();
  };

  try {
    run('git', ['init', '-q']);
    run('git', ['config', 'user.name', 'Test']);
    run('git', ['config', 'user.email', 'test@example.invalid']);
    writeFileSync(join(directory, 'package.json'), '{"version":"0.3.0"}\n');
    run('git', ['add', 'package.json']);
    run('git', ['commit', '-q', '-m', 'Source change']);
    const sourceCommit = run('git', ['rev-parse', 'HEAD']);

    assert.equal(run(python, [script]), '0.3.0');

    run('git', ['commit', '--allow-empty', '-q', '-m', 'chore(release): v0.3.0']);
    run('git', ['commit', '--allow-empty', '-q', '-m', 'Next source change']);
    assert.equal(run(python, [script]), '0.3.1');

    run('git', ['checkout', '-q', sourceCommit]);
    assert.equal(run(python, [script]), '0.3.0');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
