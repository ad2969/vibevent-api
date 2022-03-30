/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const db = require('../db');
const { replaceParam } = require('../db/utils');

const { eventPayload, userPayload, userPayload2 } = require('../db/constants');

// ErrorNotAuthorizedEventChange
hooks.before('Events > Partial Updates > Update event host > Example 1', async (transaction, done) => {

  try {

    // Create a user
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    // Save the user id to global stash
    global.stash.userId = userId;

    // Create a event
    const { eventId } = await db.postEvent({ ...eventPayload, hosts: [userId] });
    hooks.log(`~ Created a temporary user with id ${eventId}`);

    // Save the event id to global stash
    global.stash.eventId = eventId;

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);
    transaction.request.body = JSON.stringify({ hosts: [global.stash.userId] });

    // Include an invalid user id as authorization id
    transaction.request.headers.Authorization = `Bearer ${process.env.COGNITO_TEST_ID_TOKEN_INVALID}`;

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PATCH (403) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorEventDoesNotExist
hooks.before('Events > Partial Updates > Update event host > Example 2', async (transaction, done) => {

  try {

    // Replace the the body (user) and invalid param (event)
    transaction.request.body = JSON.stringify({ hosts: [global.stash.userId] });

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorUserDoesNotExist
hooks.before('Events > Partial Updates > Update event host > Example 3', async (transaction, done) => {

  try {

    // Replace the parameters and invalid body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PATCH (404) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.before('Events > Partial Updates > Update event host > Example 4', async (transaction, done) => {

  try {

    const { userId: userId2 } = await db.postUser(userPayload2);
    hooks.log(`~ Created a temporary user with id ${userId2}`);

    global.stash.userId2 = userId2;

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);
    transaction.request.body = JSON.stringify({ hosts: [global.stash.userId, userId2] });

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PATCH (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Partial Updates > Update event host > Example 4', async (transaction, done) => {

  try {

    // Delete the created stuff
    await db.deleteUser(global.stash.userId);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId}`);
    await db.deleteUser(global.stash.userId2);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId2}`);
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId}`);

    // Remove the deleted data from global stash
    global.stash.userId = null;
    global.stash.userId2 = null;
    global.stash.eventId = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorEventDoesNotExist
hooks.before('Events > Partial Updates > Contribute event rating > Example 2', async (transaction, done) => {

  try {

    // Create a user
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    // Save the user id to global stash
    global.stash.userId = userId;

    // Create a event
    const { eventId } = await db.postEvent({ ...eventPayload, hosts: [userId] });
    hooks.log(`~ Created a temporary user with id ${eventId}`);

    // Save the event id to global stash
    global.stash.eventId = eventId;

    // Replace the the body (user)
    transaction.request.body = JSON.stringify({ userId: global.stash.userId, rating: 3 });

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorUserDoesNotExist
hooks.before('Events > Partial Updates > Contribute event rating > Example 3', async (transaction, done) => {

  try {

    // Replace the parameters
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PATCH (404) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.before('Events > Partial Updates > Contribute event rating > Example 4', async (transaction, done) => {

  try {

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);
    transaction.request.body = JSON.stringify({ userId: global.stash.userId, rating: 3 });

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `PATCH (204) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Partial Updates > Contribute event rating > Example 4', async (transaction, done) => {

  try {

    // Delete the created stuff
    await db.deleteUser(global.stash.userId);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId}`);
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId}`);

    // Remove the deleted data from global stash
    global.stash.userId = null;
    global.stash.eventId = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
