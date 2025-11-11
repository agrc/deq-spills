const eslintPluginLwc = require("@lwc/eslint-plugin-lwc");
const babelParser = require("@babel/eslint-parser");

module.exports = [
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: [
              "classProperties",
              ["decorators", { decoratorsBeforeExport: false }]
            ]
          }
        }
      }
    },
    plugins: {
      "@lwc/lwc": eslintPluginLwc // https://github.com/salesforce/eslint-plugin-lwc
    },
    rules: {
      "@lwc/lwc/no-deprecated": "error",
      "@lwc/lwc/valid-api": "error",
      "@lwc/lwc/no-document-query": "error",
      "@lwc/lwc/ssr-no-unsupported-properties": "error"
    }
  }
];
