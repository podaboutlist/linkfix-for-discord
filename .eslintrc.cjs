module.exports = {
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
  ],
  plugins: [
    '@typescript-eslint',
    'import'
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
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/quotes': 'off',
  }
};
