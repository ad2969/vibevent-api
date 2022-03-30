const { validationResult } = require('express-validator');
const _ = require('lodash');

const { APIError } = require('../controllers/lib/_errors');

// ERROR HANDLING (VALIDATION)
exports.validationErrorHandler = async (req, res, next) => {

  const validationErrors = await validationResult(req);
  if (validationErrors.isEmpty()) {

    return next();

  }

  // Simply take the first error
  const data = validationErrors.array()[0];

  let error = {};
  let status = 500; // If some weird error, mark as an internal error

  // If the message is an object, this means that the message is already an APIError
  if (_.isObject(data.msg)) {

    error = data.msg;
    status = data.msg.status;

  }

  else { // Otherwise, we manually make the error object

    const source = data.param || data.query || data.body;
    const errorMessage = `${source} validation failed: ${data.msg} '${data.value}' at ${data.location}`;
    error = new APIError(errorMessage, 400, 'ValidationError');
    status = 400;

  }

  return res.status(status).json(error);

};
