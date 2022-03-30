const { body } = require('express-validator');

exports.getUrl = [
  body('*.bucketName').exists().trim().escape(),
  body('*.bucketKey').exists().trim(),
  body('*.contentType').exists().trim()
];
