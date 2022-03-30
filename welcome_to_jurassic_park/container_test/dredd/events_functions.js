/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const db = require('../db');
const { replaceParam } = require('../db/utils');

const {
  eventPayload,
  eventPayload2,
  userPayload,
  userPayload2
} = require('../db/constants');

// Not Authorized
hooks.before('Events > Functions > Check Event User Authorized > Example 1', async (transaction, done) => {

  try {

    // Create temporary users
    const { userId } = await db.postUser(userPayload);
    hooks.log(`~ Created a temporary user with id ${userId}`);
    const { userId: userId2 } = await db.postUser(userPayload2);
    hooks.log(`~ Created a temporary user with id ${userId2}`);

    // Save the user ids to global stash
    global.stash.userId = userId;
    global.stash.userId2 = userId2;

    // Create temporary events
    const { eventId } = await db.postEvent({ ...eventPayload, hosts: [userId] });
    hooks.log(`~ Created a temporary user with id ${eventId}`);
    const { eventId: eventId2 } = await db.postEvent({ ...eventPayload2, hosts: [userId2] });
    hooks.log(`~ Created a temporary user with id ${eventId2}`);

    // Save the event ids to global stash
    global.stash.eventId = eventId;
    global.stash.eventId2 = eventId2;

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', eventId2);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `GET (200) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Authorized
hooks.before('Events > Functions > Check Event User Authorized > Example 2', async (transaction, done) => {

  try {

    // Replace the parameters and body
    const url = replaceParam(transaction.fullPath, 'aaaaaaaaaaaaaaaaaaaaaaaa', global.stash.eventId);

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `GET (200) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

hooks.after('Events > Functions > Check Event User Authorized > Example 2', async (transaction, done) => {

  try {

    // Delete the created stuff
    await db.deleteUser(global.stash.userId);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId}`);
    await db.deleteUser(global.stash.userId2);
    hooks.log(`~ Deleted the temporary user with id ${global.stash.userId2}`);
    await db.deleteEvent(global.stash.eventId);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId}`);
    await db.deleteEvent(global.stash.eventId2);
    hooks.log(`~ Deleted the temporary event with id ${global.stash.eventId2}`);

    // Remove the deleted data from global stash
    global.stash.userId = null;
    global.stash.userId2 = null;
    global.stash.eventId = null;
    global.stash.eventId2 = null;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
