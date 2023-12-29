module.exports = {
  // 20% extra line length over the default 80
  printWidth: 96,

  // TypeScript parsin'
  overrides: [
    {
      files: "*.ts",
      options: {
        parser: "typescript",
      },
    },
  ],
};
