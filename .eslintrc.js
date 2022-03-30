module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // Enable console logs
    'no-console': 0,
    
    // Misc rules
	  "brace-style": [1, "stroustrup"],
    'comma-dangle': [1, 'only-multiline'],
    'consistent-return': 2,
    'newline-per-chained-call': 1,
    "max-len": 0,
    'no-control-regex': 0,
    'no-multi-spaces': 2,
    'no-multiple-empty-lines': [2, { "max": 1, "maxEOF": 1 }],
    'no-plusplus': 0,
    'no-unused-expressions': 2,
    'no-underscore-dangle': 0,
    'no-unused-vars': 1,
    'no-useless-catch': 0,
    "padded-blocks": [1, "always"],
    'quotes': [1, 'single'],
    'semi': [2, 'always', { "omitLastInOneLineBlock": true }],
  },
};
