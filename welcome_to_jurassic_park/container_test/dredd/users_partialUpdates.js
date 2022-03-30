/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const db = require('../db');
const { replaceParam } = require('../db/utils');

const { eventPayload, eventPayload2, userPayload } = require('../db/constants');

// ErrorNotAuthorizedUserChange
hooks.before('Users > Partial Updates > Update user saved events > Example 1', async (transaction, done) => {

  try {

    // Create a user
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);

    // Save the user id to global stash
    global.stash.userId = userId;

    // Create temporary events
    const { eventId } = await db.postEvent({ ...eventPayload, hosts: [userId] });
    hooks.log(`~ Created a temporary user with id ${eventId}`);
    const { eventId: eventId2 } = await db.postEvent({ ...eventPayload2, hosts: [userId] });
    hooks.log(`~ Created a temporary user with id ${eventId}`);

    // Save the event ids to global stash
    global.stash.eventId = eventId;
    global.stash.eventId2 = eventId2;

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', userId);
    transaction.request.body = JSON.stringify({ eventsSaved: [eventId] });

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

// ErrorUserDoesNotExist
hooks.before('Users > Partial Updates > Update user saved events > Example 2', async (transaction, done) => {

  try {

    // Replace the the body (user) and invalid param (event)
    transaction.request.body = JSON.stringify({ eventsSaved: [global.stash.eventId] });

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// ErrorEventDoesNotExist
hooks.before('Users > Partial Updates > Update user saved events > Example 3', async (transaction, done) => {

  try {

    // Replace the parameters and invalid body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);

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
hooks.before('Users > Partial Updates > Update user saved events > Example 4', async (transaction, done) => {

  try {

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.userId);
    transaction.request.body = JSON.stringify({ eventsSaved: [global.stash.eventId, global.stash.eventId2] });

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
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId}`);
    await db.deleteEvent(global.stash.eventId2);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId2}`);

    // Remove the deleted data from global stash
    global.stash.userId = null;
    global.stash.eventId = null;
    global.stash.eventId2 = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
