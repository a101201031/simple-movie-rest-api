module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'import/prefer-default-export': 'off',
    'import/no-import-module-exports': 'off',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['aws-lambda'],
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'consistent-return': 'off',
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};
