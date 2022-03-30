/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const jwt = require('jwt-simple');
const db = require('../db');
const { replaceParam, addQuery } = require('../db/utils');

const { eventPayload, userPayload } = require('../db/constants');

// Successful
hooks.after('Users > Users Collection > Create a new user > Example 2', async (transaction, done) => {

  try {

    const { userId } = transaction.real ? JSON.parse(transaction.real.body) : {};

    // Save the new user id to global stash
    global.stash.userId = userId;
    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// withEvents
hooks.before('Users > Users Collection > List all the users > Example 2', async (transaction, done) => {

  try {

    // Include events with query
    const url = addQuery(transaction.fullPath, 'withEvents', 'true');
    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `GET (200) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorNotAuthorizedUserChange
hooks.before('Users > Users Collection > Set a user > Example 1', async (transaction, done) => {

  try {

    // Include the user id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);

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
hooks.before('Users > Users Collection > Set a user > Example 3', async (transaction, done) => {

  try {

    // Invalid events have been included in the blueprints
    // Include the user id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);

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
hooks.before('Users > Users Collection > Set a user > Example 4', async (transaction, done) => {

  try {

    const payload = { ...eventPayload, hosts: [global.stash.userId] };

    // Create a new event
    const { eventId } = await db.postEvent(payload);
    hooks.log(`~ Created an event with id ${eventId}`);

    // Save the event id to global stash
    global.stash.eventId = eventId;

    // Include the event as one of the user's created events
    const requestBody = JSON.parse(transaction.request.body);
    requestBody.eventsCreated = [eventId];
    requestBody.eventsInvolved = [eventId];
    requestBody.eventsSaved = [eventId];

    transaction.request.body = JSON.stringify(requestBody);

    // Include the user id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PUT (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorNotAuthorizedUserChange
hooks.before('Users > Users Collection > Delete a user > Example 1', async (transaction, done) => {

  try {

    // Include the user id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);

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

// Successful
hooks.before('Users > Users Collection > Delete a user > Example 3', async (transaction, done) => {

  try {

    // Create a temporary user
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    // Save the temporary user id to global stash
    global.stash.tempUserId = userId;

    // create the authorization token from the global userId variable and send it as a header
    const authorizationObject = { 'custom:mongoid': userId, token_use: 'id' };
    transaction.request.headers.Authorization = `Bearer ${jwt.encode(authorizationObject, 'secret')}`;

    // Include the user id in the request param
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', userId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `DELETE (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Users > Users Collection > Delete a user > Example 3', async (transaction, done) => {

  try {

    // Delete the new event
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the event with id ${global.stash.eventId}`);

    // Delete the new user
    await db.deleteUser(global.stash.userId);
    hooks.log(`~ Deleted the user with id ${global.stash.userId}`);

    // Remove the deleted data from global stash
    global.stash.eventId = null;
    global.stash.userId = null;
    global.stash.tempUserId = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
