const _ = require('lodash');
const Users = require('./lib/users');
const Events = require('./lib/events');

const { throwError } = require('./lib/_errors');

// Syntax validations belong in in 'src/validators'
// Controller validation involve async validations to the database

exports.queryUsers = async (req, res) => {

  try {

    const { withEvents = false, results, name } = req.query;

    if (!req.admin) throwError(403, 'The user does not have the required permissions to access that resource', 'UserPermissionError');

    const options = {
      limit: results,
      withEvents,
      filters: {
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } }
        ]
      }
    };

    const users = await Users.getUsers('all', options);

    const usersById = _.keyBy(users, '_id');

    res.status(200).json(usersById);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.queryUsersByIds = async (req, res) => {

  try {

    const { userIds } = req.params;
    const { withEvents = false } = req.query;
    const { id: authorizationId } = req.user;

    if (!req.admin) {

      // If not an admin, check that the host ID matches the id passed into Authorization header
      await Promise.all(
        userIds.map((userId) => Users.check.userAuthorizationId(authorizationId, userId))
      );

    }

    const users = await Users.getUsers(userIds, { withEvents });

    const usersById = _.keyBy(users, '_id');

    res.status(200).json(usersById);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.createUser = async (req, res) => {

  try {

    const userInfo = req.body;

    const result = await Users.createUser(userInfo);

    res.status(201).json({ userId: result._id });

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

// SET (PUT)
exports.setUserById = async (req, res) => {

  try {

    const { userId } = req.params;
    const { eventsInvolved = [], eventsCreated = [], eventsSaved = [] } = req.body;
    const { id: authorizationId } = req.user;

    // Do checks
    await Users.check.userValid(userId); // Check if user exists

    // If not admin-privileged, check that the host ID matches the id passed into Authorization header
    if (!req.admin) await Users.check.userAuthorizationId(authorizationId, userId);

    await Promise.all([ // Check for event validity
      eventsInvolved ? Promise.all(eventsInvolved.map((event) => Events.check.eventValid(event))) : null,
      eventsCreated ? Promise.all(eventsCreated.map((event) => Events.check.eventValid(event))) : null,
      eventsSaved ? Promise.all(eventsSaved.map((event) => Events.check.eventValid(event))) : null,
    ]);

    // Finally, update the user
    await Users.setUser(userId, req.body);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.deleteUserById = async (req, res) => {

  try {

    const { userId } = req.params;
    const { id: authorizationId } = req.user;

    // Do checks
    await Users.check.userValid(userId); // Check if user exists

    // If not admin-privileged, check that the host ID matches the id passed into Authorization header
    if (!req.admin) await Users.check.userAuthorizationId(authorizationId, userId);

    // Finally, delete the user
    await Users.deleteUser(userId);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.updateUserEventsSaved = async (req, res) => {

  try {

    const { userId } = req.params;
    const { id: authorizationId } = req.user;
    const { eventsSaved } = req.body;

    // Do checks
    await Users.check.userValid(userId); // Check if user exists

    // Check that the host ID matches the id passed into Authorization header
    if (!req.admin) await Users.check.userAuthorizationId(authorizationId, userId);

    // check that all the events are valid
    await Promise.all(eventsSaved.map((event) => Events.check.eventValid(event)));

    // do the updating
    await Users.setUser(userId, { eventsSaved });

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};
