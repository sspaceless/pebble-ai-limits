import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['build/**', 'dist/**', '.venv/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['src/pkjs/**/*.js'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'commonjs',
      globals: { ...globals.browser, Pebble: 'readonly' }
    }
  },
  {
    rules: {
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
