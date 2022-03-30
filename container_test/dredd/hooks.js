/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const jwt = require('jwt-simple');
const { stringify } = require('../db/utils');
const db = require('../db');
const mongo = require('../db/mongodb');

const roleData = require('../assets/__roles.json');
const { developerPayload } = require('../db/constants');

// @ad2969's documentation on Dredd

// By default, transactions need to be sent in JSON format, while the
// REQUEST BODY received from transactions need to be in STRING format.
// This means that the REQUEST BODY needs to be parsed before being edited.

// Utility functions are available in '../db/utils.js'
// Payload constants are available to use in '../db/constants.js'
// A number of database functions are available in '../db/index.js',
//   The db functions directly alter the database through the official mongodb package

// Running Dredd will test all the api-blueprints located in the 'api-blueprints' folder
// The 'npm run test' script opens new Docker containers for the api, the test container, and
// an instance of the mongodb database. The tests are then run on the local database instance.
// The containers will close and remove themselves after the tests are completed/stopped.

// As seen in the blueprints, parameter ids will be defaulted as 'aaaaaaaaaaaaaaaaaaaaaaaa'
// or `bbbbbbbbbbbbbbbbbbbbbbbb` for multiple parameters
// This makes it easy to alter by using the 'replaceParam' function in 'utils'

// LINKS:
// https://dredd.org/en/latest/how-to-guides.html

// Further notes:
// Use `dredd --names` to list out the hook transaction objects
// Running `dredd` without docker will not work, because the mongodb connections
// rely on a mongo docker container running under the name "db"

hooks.beforeAll(async (transactions, done) => {

  // drop all data first (if between test cases)
  await mongo.resetCollections();

  hooks.log('Initializing refresh data');
  await mongo.insertDocuments('roles', roleData);

  // Create a temporary user
  const { userId } = await db.postUser(developerPayload);
  hooks.log(`~ Created a developer user with id ${userId}`);

  // initialize global stash
  global.stash = {
    developerId: userId,
    userId: null,
    eventId: null,
    categoryKeys: []
  };

  hooks.log('Running Dredd tests from "compiled.apib"');
  done();

});

hooks.afterAll((transactions, done) => {

  hooks.log('Completing Dredd tests');
  done();

});

hooks.beforeEach((transaction, done) => {

  // create the authorization token from the global userId variable
  const authorizationObject = {
    'custom:mongoid': (global.stash && global.stash.developerId) || 'aaaaaaaaaaaaaaaaaaaaaaaa',
    token_use: 'id',
  };

  const authorizationToken = jwt.encode(authorizationObject, 'secret');

  // alter the headers
  transaction.request.headers = {
    Authorization: `Bearer ${authorizationToken}`, // include authorization header
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Connection: 'Keep-Alive',
    'Content-Type': 'application/json; charset=utf-8',
    // 'User-Agent': 'Dredd/13.0.2 (Darwin 19.2.0; x64)'
  };

  transaction.request.body = stringify(transaction.request.body);

  done();

});

// hooks.beforeEachValidation((transaction, done) => {

//   hooks.log(`before each validation, ${transaction.id}`);
//   done();

// });

// hooks.beforeValidation('Machines > Machines collection > Get Machines', (transaction, done) => {
//   hooks.log('before validation');
//   done();
// });

// hooks.afterEach((transaction, done) => {
//   hooks.log('Hook after each transaction', transaction);
//   done();
// });
