module.exports = [
  // CATEGORIES (might need to specify what type of category - 'event_categories'?)
  ['get', '/categories', 'categories', 'queryCategories', false],
  ['post', '/categories', 'categories', 'addCategory', true, 'CATEGORIES/CREATE'],
  ['delete', '/categories/:categoryKey', 'categories', 'deleteCategory', true, 'CATEGORIES/DELETE'],

  // EVENTS
  ['get', '/events', 'events', 'queryEvents', false],
  ['get', '/events/:eventIds', 'events', 'queryEventsByIds', false],
  ['post', '/events', 'events', 'createEvent', true, 'EVENTS/CREATE'],
  ['put', '/events/:eventId', 'events', 'setEventById', true, 'EVENTS/EDIT'],
  ['delete', '/events/:eventId', 'events', 'deleteEventById', true, 'EVENTS/DELETE'],

  ['patch', '/events/:eventId/host', 'events', 'updateEventHost', true, 'EVENTS/EDIT'],
  ['patch', '/events/:eventId/rate', 'events', 'contributeEventRating', true, 'EVENTS/CONTRIBUTE'],
  // ['patch', '/events/:eventId/tag', 'events', 'addEventTag', true],
  // ['patch', '/events/:eventId/media/photo', 'events', 'addEventPhoto', true],
  ['get', '/events/:eventId/user/authorized', 'events', 'checkEventUserAuthorized', true],

  // IMAGES
  ['post', '/images', 'images', 'getUrl', true, 'IMAGES/CREATE'],

  // USERS
  ['get', '/users', 'users', 'queryUsers', true, 'USERS/GET'],
  ['get', '/users/:userIds', 'users', 'queryUsersByIds', true, 'USERS/GET'],
  ['post', '/users', 'users', 'createUser', false],
  ['put', '/users/:userId', 'users', 'setUserById', true, 'USERS/EDIT'],
  ['delete', '/users/:userId', 'users', 'deleteUserById', true, 'USERS/DELETE'],

  ['patch', '/users/:userId/events_saved', 'users', 'updateUserEventsSaved', true, 'USERS/EDIT'],

  // HEALTH
  ['get', '/health', 'health', 'healthcheck', false],
  ['get', '/health/auth', 'health', 'healthcheck', true]
];
