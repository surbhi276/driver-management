module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "./node_modules/@moia-oss/eslint-prettier-typescript-config/config/eslint",
    "./node_modules/@moia-oss/eslint-prettier-typescript-config/config/eslint-strict",
  ],
  rules: {
    "no-console": "off",
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/consistent-type-imports": "off",
  },
  overrides: [
    {
      files: ["cdk/**/*"],
      extends: [
        "./node_modules/@moia-oss/eslint-prettier-typescript-config/config/eslint-cdk",
      ],
    },
  ],
};
