module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'airbnb-typescript/base'
  ],
  plugins: [
    'import',
    '@typescript-eslint'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  root: true,
  ignorePatterns: [
    '*.js',
    '*.cjs',
    'dist/**'
  ],
  rules: {
    '@typescript-eslint/quotes': 'off',
  }
};
