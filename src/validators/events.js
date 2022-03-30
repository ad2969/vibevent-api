const { body, param, query } = require('express-validator');
const { isLongLat, areMongoIds, isNotEmpty } = require('./_common');
const { LOCATION_TYPES } = require('../constants').LOCATION;

exports.queryEvents = [
  query('withHosts').toBoolean(),
  query('results').toInt(),
  query('name').trim().escape(),
  query('radius').optional().toFloat(),
  query('coordinates').optional().unescape().customSanitizer((val) => val.split(','))
    .custom(isLongLat)
    .customSanitizer((coords) => [parseFloat(coords[0]), parseFloat(coords[1])])
];

exports.queryEventsByIds = [
  query('withHosts').toBoolean(),
  param('eventIds').unescape().customSanitizer((val) => val.split(',')),
];

exports.createEvent = [
  body('name').exists().escape().trim(),
  body('startDate').exists().isISO8601('yyyy-mm-dd'),
  body('endDate').exists().isISO8601('yyyy-mm-dd'),

  body('venue').exists(),
  body('venue.name').optional(),
  body('venue.location').optional(),
  body('venue.location.type')
    .if(body('venue.location').exists()).exists().isIn(LOCATION_TYPES),
  body('venue.location.coordinates')
    .if(body('venue.location').exists()).exists().custom(isLongLat),

  body('hosts').exists().isArray().custom(isNotEmpty)
    .custom(areMongoIds),
  body('price').optional().isFloat(),
  body('description').optional(),
  // rating shouldn't be included
  body('rating').optional().customSanitizer(() => {}),
  body('categories').optional().isArray(),

  body('links').optional(),
  body('links.*.name').exists(),
  body('links.*.url').exists().isURL(),

  body('coverPhoto').optional(),
  body('coverPhoto.url')
    .if(body('coverPhoto').exists()),
  body('coverPhoto.size.width').optional().isInt(),
  body('coverPhoto.size.height').optional().isInt(),

  body('media').optional(),
  body('media.*.url'),
  body('media.*.size.width').optional().isInt(),
  body('media.*.size.height').optional().isInt(),

  body('tags').optional().isArray(),
  body('tags.*').optional().escape().trim(),

  body('rooms').optional().isArray(),
  body('rooms.*.type').exists().escape().trim(),
  body('rooms.*.url').exists().isURL(),
  body('rooms.*.name').optional().escape().trim()
];

exports.setEventById = [
  param('eventId').exists().isMongoId(),

  body('name').exists().escape().trim(),
  body('startDate').exists().isISO8601('yyyy-mm-dd'),
  body('endDate').exists().isISO8601('yyyy-mm-dd'),

  body('venue').exists(),
  body('venue.name').optional().escape().trim(),
  body('venue.location').optional(),
  body('venue.location.type')
    .if(body('venue.location').exists()).exists().isIn(LOCATION_TYPES),
  body('venue.location.coordinates')
    .if(body('venue.location').exists()).exists().custom(isLongLat),

  // hosts should not be able to be updated through this endpoint.
  body('hosts').customSanitizer(() => {}),
  body('price').optional().isFloat(),
  body('description').optional(),
  body('rating').optional(),
  body('rating.sum')
    .if(body('rating').exists()).isFloat(),
  body('rating.count')
    .if(body('rating').exists()).isFloat(),
  body('categories').optional().isArray(),

  body('links').optional(),
  body('links.*.name').exists(),
  body('links.*.url').exists().isURL(),

  body('media').optional(),

  body('media.hostPhotos.*.url'),
  body('media.hostPhotos.*.size.width').optional().isInt(),
  body('media.hostPhotos.*.size.height').optional().isInt(),

  body('media.userPhotos.*.url'),
  body('media.userPhotos.*.size.width').optional().isInt(),
  body('media.userPhotos.*.size.height').optional().isInt(),

  body('media.coverPhoto.url')
    .if(body('media.coverPhoto').exists()),
  body('media.coverPhoto.size.width').optional().isInt(),
  body('media.coverPhoto.size.height').optional().isInt(),

  body('tags.hostTags').optional().isArray(),
  body('tags.hostTags.*').escape().trim(),
  body('tags.userTags').optional().isArray(),
  body('tags.userTags.*').escape().trim(),

  body('rooms').optional().isArray(),
  body('rooms.*.type').exists().escape().trim(),
  body('rooms.*.url').exists().isURL(),
  body('rooms.*.name').optional().escape().trim()
];

exports.deleteEventById = [
  param('eventId').exists().isMongoId()
];

// functions

exports.checkEventUserAuthorized = [
  param('eventId').exists().isMongoId()
];

// partial updates

exports.updateEventHost = [
  param('eventId').exists().isMongoId(),

  body('hosts').exists().isArray().custom(areMongoIds)
];

exports.contributeEventRating = [
  param('eventId').exists().isMongoId(),

  body('userId').exists().isMongoId(),
  body('rating').exists().isInt(),
];
