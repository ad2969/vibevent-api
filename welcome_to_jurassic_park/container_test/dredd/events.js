/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const db = require('../db');
const { replaceParam, addQuery } = require('../db/utils');

const { eventPayload, userPayload, userPayload2 } = require('../db/constants');

// ErrorMissingFields
hooks.before('Events > Events Collection > Create a new event > Example 1', async (transaction, done) => {

  try {

    // Create a temporary user
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    const { categoryKey } = await db.postCategory({ name: 'Music', key: 'MUS' });
    hooks.log(`~ Created a temporary category ${categoryKey}`);

    // Save the temporary user id to global stash
    global.stash.userId = userId;

    // Save the temporary category to global stash
    global.stash.categoryKeys[0] = categoryKey;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorInvalidCategory
hooks.before('Events > Events Collection > Create a new event > Example 2', async (transaction, done) => {

  try {

    // Include the temporary user id as a host
    const currentPayload = JSON.parse(transaction.request.body);
    const payload = { ...currentPayload, hosts: [global.stash.userId] };
    transaction.request.body = JSON.stringify(payload);

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorInvalidHost
hooks.before('Events > Events Collection > Create a new event > Example 4', async (transaction, done) => {

  try {

    // Include an invalid user id as authorization id
    transaction.request.headers.Authorization = `Bearer ${process.env.COGNITO_TEST_ID_TOKEN_INVALID}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.before('Events > Events Collection > Create a new event > Example 5', async (transaction, done) => {

  try {

    // Include the user id as a host
    const currentPayload = JSON.parse(transaction.request.body);
    const payload = { ...currentPayload, hosts: [global.stash.userId] };
    transaction.request.body = JSON.stringify(payload);

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Events Collection > Create a new event > Example 5', async (transaction, done) => {

  try {

    // use case for "dredd --names" (if skip)
    const { eventId } = transaction.real ? JSON.parse(transaction.real.body) : {};

    // Save the new event id to global stash
    global.stash.eventId = eventId;
    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Invalid coordinate values
hooks.before('Events > Events Collection > List all the events > Example 1', async (transaction, done) => {

  try {

    // Change coordinates to invalid values
    const url = addQuery('/events', 'coordinates', '-1000%2C-1000');

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `GET (400) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorNotAuthorizedEventChange
hooks.before('Events > Events Collection > Set an event > Example 1', async (transaction, done) => {

  try {

    // Include the event id as a parameter
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PUT (403) ${url}`;

    // Include an invalid user id as authorization id
    transaction.request.headers.Authorization = `Bearer ${process.env.COGNITO_TEST_ID_TOKEN_INVALID}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorEventDoesNotExist
hooks.before('Events > Events Collection > Set an event > Example 2', async (transaction, done) => {

  try {

    // Include an invalid event id as a parameter
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', '000000000000000000000000');

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PUT (404) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.before('Events > Events Collection > Set an event > Example 3', async (transaction, done) => {

  try {

    // Create a temporary user
    const { userId } = await db.postUser(userPayload2);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    // Save the temporary user id to global stash
    global.stash.tempUserId = userId;

    // Include the event id as a parameter
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    // Include the user id as a host
    const currentPayload = JSON.parse(transaction.request.body);
    const payload = { ...currentPayload, hosts: [global.stash.userId, userId] };
    transaction.request.body = JSON.stringify(payload);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PUT (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Events Collection > Set an event > Example 3', async (transaction, done) => {

  try {

    // Delete the temporary user
    await db.deleteUser(global.stash.tempUserId);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.tempUserId}`);

    global.stash.tempUserId = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorNotAuthorizedEventChange
hooks.before('Events > Events Collection > Delete an event > Example 1', (transaction, done) => {

  try {

    // Include the event id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `DELETE (403) ${url}`;

    // Include an invalid user id as authorization id
    transaction.request.headers.Authorization = `Bearer ${process.env.COGNITO_TEST_ID_TOKEN_INVALID}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorEventDoesNotExist
hooks.before('Events > Events Collection > Delete an event > Example 2', (transaction, done) => {

  try {

    // Include the event id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', '000000000000000000000000');

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `DELETE (404) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.before('Events > Events Collection > Delete an event > Example 3', async (transaction, done) => {

  try {

    const payload = { ...eventPayload, hosts: [global.stash.userId] };

    // Create a new temporary event
    const { eventId } = await db.postEvent(payload);
    hooks.log(`~ Created a temporary event with id ${eventId}`);

    // Save the temporary event id to global stash
    global.stash.tempEventId = eventId;

    // Include the event id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `DELETE (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Events Collection > Delete an event > Example 3', async (transaction, done) => {

  try {

    // Delete the created stuff
    await db.deleteUser(global.stash.userId);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId}`);
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId}`);
    await db.deleteCategory(global.stash.categoryKeys[0]);
    hooks.log(`~ Deleted the temporary category ${global.stash.categoryKeys[0]}`);
    await db.deleteCategory(global.stash.categoryKeys[1]);
    hooks.log(`~ Deleted the temporary category ${global.stash.categoryKeys[1]}`);

    // Remove the deleted data from global stash
    global.stash.userId = null;
    global.stash.eventId = null;
    global.stash.tempEventId = null;
    global.stash.categoryKeys = [];

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
