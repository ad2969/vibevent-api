const { body, param, query } = require('express-validator');
const { areMongoIds } = require('./_common');
const { ROLES } = require('../constants');

exports.queryUsers = [
  query('withEvents').toBoolean(),
  query('results').toInt(),
  query('name').trim().escape()
];

exports.queryUsersByIds = [
  param('userIds').unescape().customSanitizer((val) => val.split(',')),
  // validation is handled specifically in controller in order to 'remove' invalid ids
  query('withEvents').toBoolean()
];

exports.createUser = [
  body('role').customSanitizer(() => ROLES.DEFAULT),
  // set a newly created user to have the default role
  body('firstName').exists().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('email').exists().isEmail(),
  body('username').trim().escape(),
  // don't include any events on user create
  body('eventsInvolved').customSanitizer(() => []),
  body('eventsCreated').customSanitizer(() => []),
  body('eventsSaved').customSanitizer(() => [])
];

exports.setUserById = [
  param('userId').exists().isMongoId(),

  body('role').customSanitizer(() => null),
  // cannot change roles when setting user (custom endpoint needed)
  body('firstName').exists().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('email').exists().isEmail(),
  body('username').optional().trim().escape(),
  body('eventsInvolved').optional().isArray().custom(areMongoIds),
  body('eventsCreated').optional().isArray().custom(areMongoIds),
  body('eventsSaved').optional().isArray().custom(areMongoIds)
];

exports.deleteUserById = [
  param('userId').exists().notEmpty().isMongoId()

];

exports.updateUserEventsSaved = [
  param('userId').exists().notEmpty().isMongoId(),

  body('eventsSaved').optional().isArray().custom(areMongoIds)
];
