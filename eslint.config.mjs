import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
  {
    files: ['**/*.js'],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      // Require JSDoc for functions and classes
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      // Catch missing parameters/return tags and bad types
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/check-types': 'error',
    },
  },
  // Prevent require-jsdoc from running on test, config, and internal infrastructure files
  {
    files: [
      "**/tests/**/*.test.js",
      "**/*.config.js",
      "lib/http/**/*.js",
      "lib/vvRestApi/constants.js",
      "lib/VVRestApi.js"
    ],
    rules: {
      "jsdoc/require-jsdoc": "off"
    }
  }
];