/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const jwt = require('jwt-simple');

// Missing Authorization Header
hooks.before('Authcheck > Authcheck > Example 1', async (transaction, done) => {

  try {

    // alter the Authorization header
    transaction.request.headers.Authorization = 'Bear';

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Invalid Authorization header
hooks.before('Authcheck > Authcheck > Example 2', async (transaction, done) => {

  try {

    // create the authorization token from the global userId variable
    const authorizationObject = {
      'custom:mongoid': 'aaaaaaaaaaaaaaaaaaaaaaaa',
      token_use: 'id',
    };
    const authorizationToken = jwt.encode(authorizationObject, 'secret');

    // alter the Authorization header (no "Bearer")
    transaction.request.headers.Authorization = authorizationToken;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Invalid JWT Token
hooks.before('Authcheck > Authcheck > Example 3', async (transaction, done) => {

  try {

    // alter the Authorization header
    transaction.request.headers.Authorization = 'Bearer i-am.a.randomandinvalid-jwt.token';
    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});

// Successful
hooks.after('Authcheck > Authcheck > Example 4', async (transaction, done) => {

  try {

    hooks.log(`Auth check results: ${transaction.body}`);
    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
