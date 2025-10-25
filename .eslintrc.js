module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Best Practices
    'no-console': 'off', // Allow console for debugging
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Error Prevention
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-atomic-updates': 'error',
    
    // Code Style
    'arrow-body-style': ['error', 'as-needed'],
    'object-shorthand': 'error',
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'warn',
    
    // ES6
    'no-duplicate-imports': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    
    // Prettier integration
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: true,
      trailingComma: 'es5',
      printWidth: 100,
      tabWidth: 2
    }]
  },
  globals: {
    chrome: 'readonly',
    FFmpeg: 'readonly'
  }
};