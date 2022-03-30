// ----
// CUSTOM ERROR GENERATOR
// ----
const APIError = class CustomAPIError {

  constructor(message, status, source = 'Error') {

    this.name = source;
    this.message = message;
    this.status = status;
    this.date = new Date();
    this.stack = (new Error()).stack;

  }

};

// ----
// CUSTOM ERROR MESSAGES
// ----
exports.ErrorInvalidCategory = 'Sorry! One or more of the submitted values are not in the category list.';

exports.ErrorInvalidId = 'Sorry! Invalid id was given.';

exports.ErrorInvalidLocation = 'Sorry! An invalid location object was given.';

exports.ErrorUnauthorizedEventChange = 'Sorry! You are unauthorized to make the requested changes to this event.';

// ----
// CUSTOM ERROR FUNCTION MESSAGES
// ----
exports.categoryDoesNotExist = (id = null) => (id ? `Sorry! The category '${id}' does not exist.`
  : 'Sorry! The category does not exist!');

exports.eventDoesNotExist = (id = null) => (id ? `Sorry! The event with id ${id} does not exist.`
  : 'Sorry! The event with the given id does not exist!');

exports.idIsInvalid = (id = null) => (id ? `Sorry! The id ${id} is an invalid MongoDB id syntax.`
  : 'Sorry! The given id is an invalid MongoDB id syntax.');

exports.userDoesNotExist = (id = null) => (id ? `Sorry! The user with id ${id} does not exist.`
  : 'Sorry! The user with the given id does not exist!');

// ----
// CUSTOM ERROR HANDLERS
// ----
const handleMongoError = (err) => {

  let source = `MONGO:${err.name}`;
  if (err.code === 11000) source = `${err.name}:Duplicate`;

  throw new APIError(err.errmsg, 400, source);

};

const handleAWSError = (err) => {

  // AWS Error Object:
  // { message, code, time }

  const source = `AWS:${err.code}`;

  throw new APIError(err.message, 400, source);

};

exports.APIError = APIError;

exports.handleMongoError = handleMongoError;
exports.handleAWSError = handleAWSError;

// ----
// CUSTOM ERROR THROWS
// ----
exports.throwError = (status = 500, message = 'An error was thrown!', source = 'UnknownError') => {

  throw new APIError(message, status, source);

};
