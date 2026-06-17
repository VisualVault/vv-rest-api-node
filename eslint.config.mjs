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
        'warn',
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
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/check-types': 'warn',
    },
  },
  // Prevent require-jsdoc from running on test and config files
  {
    files: [
      "**/tests/**/*.test.js",
      "**/*.config.js"
    ],
    rules: {
      "jsdoc/require-jsdoc": "off"
    }
  }
];