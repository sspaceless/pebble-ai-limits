import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sources(path) : /\.[ch]$/.test(path) ? [path] : [];
  });
}

const files = sources('src/c');
const write = process.argv.includes('--write');
const command = process.env.CLANG_FORMAT || '.venv/bin/clang-format';
for (const file of files) {
  const result = spawnSync(command, write ? ['-i', file] : [file], { encoding: 'utf8' });
  if (result.error) {
    console.error(`${command}: ${result.error.message}. Install requirements-dev.txt first.`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exit(1);
  }
  if (!write && result.stdout !== readFileSync(file, 'utf8')) {
    console.error(`${file} needs formatting. Run npm run format.`);
    process.exitCode = 1;
  }
}
