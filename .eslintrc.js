module.exports = {
  extends: ["prettier", "eslint:recommended"],
  plugins: ["import"],
  env: {
    node: true,
    es6: true,
  },
  root: true,
  ignorePatterns: ["/dist"],
  overrides: [
    {
      files: ["*.ts"],
      extends: [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/strict-type-checked",
      ],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      rules: {
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/quotes": "off",
      },
    },
  ],
};
