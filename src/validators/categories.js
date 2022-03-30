const { body, param } = require('express-validator');

exports.addCategory = [
  body('categoryName').exists().isString().unescape()
    .trim()
    .customSanitizer((val) => val.toLowerCase()),
  body('categoryKey').exists().isString().unescape()
    .trim()
    .customSanitizer((val) => val.toUpperCase())
    .isLength({ max: 5 })
];

exports.deleteCategory = [
  param('categoryKey').exists().isString().unescape()
    .trim()
    .customSanitizer((val) => val.toUpperCase())
    .isLength({ max: 5 })
];
