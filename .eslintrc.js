module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin', 'import', 'jest', 'prettier'],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-plugin/all',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/extensions': ['error', { ts: 'ignorePackages' }],
  },
  overrides: [
    {
      files: ['tests/**'],
      env: {
        jest: true,
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-alias-methods': 'error',
        'jest/no-identical-title': 'error',
        'jest/no-jasmine-globals': 'error',
        'jest/no-test-prefixes': 'error',
        'jest/no-test-return-statement': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/prefer-spy-on': 'error',
        'jest/valid-expect': 'error',
        'jest/no-done-callback': 'off',
        'no-console': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: true,
      typescript: true,
    },
  },
}
