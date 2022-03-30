const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const api = express();
const cors = require('cors');

// Automatically require files inside directories
const requireDir = require('./src/utils/requireDir');

const routes = require('./src/routes');

const validators = requireDir('./src/validators');
const controllers = requireDir('./src/controllers');

const { validationErrorHandler } = require('./src/validators/_errors');
const { morganMiddleware, responseLoggingMiddleware } = require('./src/logging');
const { authMiddleware } = require('./src/auth');
const { permissionMiddleware } = require('./src/permission');

// Obtain environmental values
require('dotenv').config();

const SERVER_PORT = process.env.SERVER_PORT || 3000;

const NODE_ENV = process.env.NODE_ENV || 'local';
if (!process.env.NODE_ENV) console.log(`API environment not specified! Running in '${NODE_ENV}' environment...`);
else console.log(`Running API in '${NODE_ENV}' environment...`);

// special case for not logging (morgan) during 'npm run test'
const LOGS = process.env.LOGS || false;
if (LOGS) console.log('Logs specified!');

const MONGO_DB = process.env.MONGO_DB || 'event-discovery-api';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_USER = process.env.MONGO_USER || 'test';
const MONGO_PWD = process.env.MONGO_PWD || 'test';
const { MONGO_HOST, MONGO_CONTAINER } = process.env;

// Evaluate the current NODE_ENV and configure the mongo URI appropriately
let MONGO_URI = `mongodb://localhost:${MONGO_PORT}/${MONGO_DB}`; // By default, use the local mongo instance
if ((NODE_ENV === 'local' || NODE_ENV === 'test')
&& MONGO_CONTAINER) { // If MONGO_CONTAINER is specified, use the local mongo container

  MONGO_URI = `mongodb://${MONGO_CONTAINER}:${MONGO_PORT}/${MONGO_DB}`;

}
else if (MONGO_HOST) { // Otherwise, use the provided MONGO_HOST if provided (external mongo db)

  MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}/${MONGO_DB}`;

}

// MongoDB
mongoose.connect(MONGO_URI,
  {
    // mongodb deprecation
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  (err) => {

    if (err) console.log(`Error connection to mongodb at ${MONGO_URI}`, err);
    else if (MONGO_CONTAINER) console.log(`Connected to container '${MONGO_CONTAINER}' on port ${MONGO_PORT}!`);
    else if (MONGO_HOST) console.log(`Connected to mongodb on external db '${MONGO_DB}'!`);
    else console.log(`Connected to mongodb on port ${MONGO_PORT}!`);

  });

// Closes mongo connections on application close
process.on('SIGINT', () => {

  mongoose.connection.close(() => {

    console.log('\nMongoose connection closed due to app termination!');
    process.exit(0);

  });

});

// Middlewares
if (LOGS) {

  api.use(morganMiddleware);
  api.use(responseLoggingMiddleware);

}
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(cors());

// Setup each of the endpoints
routes.forEach(([method, path, controller, func, authenticateToken = false, permission = false]) => {

  // 1. Include validator (check if doesn't exist)
  const validator = (validators[controller] && validators[controller][func])
    || ([]);
  // 2. Validation check function
  const validationCheck = validationErrorHandler;
  // 3. Authorization token check function
  const authTokenCheck = authenticateToken ? authMiddleware : (req, res, next) => next();
  // 4. Check if the authenticated user has permissions
  const permissionCheck = (authenticateToken && permission) ? (req, res, next) => permissionMiddleware(req, res, next, permission) : (req, res, next) => next();
  // 5. Include controller (check if doesn't exist)
  const controllerFunction = (controllers[controller] && controllers[controller][func])
    || ((req, res) => res.status(501).json({ name: 'EndpointError ', message: 'Functionality not implemented!' }));
  // Initialize
  api[method](path, validator, validationCheck, authTokenCheck, permissionCheck, controllerFunction);

});

// Start listening on SERVER_PORT
api.listen(SERVER_PORT, () => {

  console.log(`Listening at port ${SERVER_PORT}...`);

});
