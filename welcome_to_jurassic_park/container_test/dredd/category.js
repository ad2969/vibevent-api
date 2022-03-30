/* eslint-disable no-param-reassign */

const hooks = require('hooks');
const { replaceParam } = require('../db/utils');

hooks.before('Categories > Categories > Delete a category > Example 1', async (transaction, done) => {

  try {

    const url = replaceParam(transaction.fullPath, 'IAAC', 'NOPE');

    transaction.fullPath = url;
    transaction.request.uri = url;
    transaction.id = `DELETE (404) ${url}`;

    done();

  }
  catch (err) {

    hooks.log(`** Error: ${err}`);

  }

});
