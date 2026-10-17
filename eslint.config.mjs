import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['build/**', 'dist/**', '.venv/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: { 'no-var': 'error', 'prefer-const': 'error', 'prefer-arrow-callback': 'error' }
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
    files: ['src/pkjs/**/*.js'],
    ignores: ['src/pkjs/resources/**'],
    rules: {
      'no-magic-numbers': ['error', { ignore: [-1, 0, 1], detectObjects: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[regex]',
          message: 'Use a named resource constant for application patterns.'
        },
        {
          selector:
            'Literal[value=type(string)][value!=""]' +
            ':not(CallExpression[callee.name="require"] > Literal)' +
            ':not(Property:not([computed=true]) > Literal.key)' +
            ':not(BinaryExpression[left.type="UnaryExpression"][left.operator="typeof"] > Literal.right)' +
            ':not(BinaryExpression[right.type="UnaryExpression"][right.operator="typeof"] > Literal.left)',
          message: 'Use a named resource constant for application strings.'
        },
        {
          selector:
            'Program > :not(ImportDeclaration):not(ExpressionStatement[directive])' +
            ':not(VariableDeclaration:has(CallExpression[callee.name="require"]))' +
            ' ~ VariableDeclaration:has(CallExpression[callee.name="require"])',
          message: 'Declare CommonJS dependencies before local state and implementation.'
        }
      ]
    }
  },
  {
    rules: {
      'array-callback-return': ['error', { checkForEach: true }],
      'block-scoped-var': 'error',
      'default-case-last': 'error',
      'dot-notation': 'error',
      'guard-for-in': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-constructor-return': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-implicit-coercion': ['error', { boolean: false }],
      'no-implied-eval': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-multi-assign': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-proto': 'error',
      'no-return-assign': ['error', 'always'],
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'object-shorthand': 'off',
      'one-var': ['error', 'never'],
      'operator-assignment': ['error', 'always'],
      radix: 'error',
      yoda: ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['function', 'class'] },
        { blankLine: 'always', prev: ['function', 'class'], next: '*' },
        {
          blankLine: 'always',
          prev: '*',
          next: ['if', 'for', 'while', 'do', 'switch', 'try', 'return', 'throw']
        },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'cjs-import', next: '*' },
        { blankLine: 'always', prev: '*', next: 'cjs-import' },
        { blankLine: 'any', prev: 'cjs-import', next: 'cjs-import' },
        { blankLine: 'always', prev: '*', next: 'cjs-export' },
        { blankLine: 'any', prev: 'cjs-export', next: 'cjs-export' }
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  }
];
