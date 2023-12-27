module.exports = {
  // Slightly longer line length. I like Black's choice of 88 (10% extra)
  printWidth: 88,

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
