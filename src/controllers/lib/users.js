const _ = require('lodash');
const { UserModel } = require('../../models/user');
const { ROLES, MONGOOSE } = require('../../constants');
const Common = require('./_common');
const errors = require('./_errors');
const { updateMongoObject } = require('../../utils');

const { APIError } = errors;
const { dataFilter: userDataFilter } = MONGOOSE;

// ----
// CHECKS
// ----
const checkUserAuthorizationId = async (authorizationId, userId) => {

  try {

    if (authorizationId !== userId) {

      throw new APIError('Sorry! You are unauthorized to make the requested changes to this user.', 403, 'ErrorNotAuthorizedUserChange');

    }

  }
  catch (err) {

    throw err;

  }

};

const checkUserValid = async (userId) => {

  try {

    const user = await UserModel.findById(userId).lean();
    if (_.isEmpty(user)) throw new APIError(errors.userDoesNotExist(userId), 404, 'ErrorUserDoesNotExist');

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

// ----
// ENDPOINTS
// ----

const getUsers = async (ids, options = {}) => {

  try {

    const { filters = {}, withEvents } = options;
    let userIds = ids;

    let users = UserModel.find(filters);

    // form the query parameters
    if (userIds !== 'all') {

      if (!_.isArray(userIds)) userIds = [userIds];

      // Remove invalid ids from the array
      const filteredIds = await Common.removeInvalidIds(userIds);

      users = users.where('_id').in(filteredIds);

    }

    users = users.select(userDataFilter);
    if (options.limit) users = users.limit(options.limit);
    if (withEvents) {

      users = users
        .populate('eventsInvolved')
        .populate('eventsCreated')
        .populate('eventsSaved');

    }

    // finally execute
    users = await users.lean().exec();
    return users;

  }
  catch (err) {

    // Special case (if userIds are invalid/not found, return an empty object instead of an error)
    if (err.name === 'CastError') return {};
    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const createUser = async (userInfo) => {

  try {

    const newUser = new UserModel({
      ...userInfo,
      role: ROLES.DEFAULT
    });
    const result = await newUser.save();

    return result;

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const setUser = async (userId, userInfo) => {

  try {

    const user = await UserModel.findById(userId);

    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        ...userInfo,
        // use the existing user role
        role: user.role
      },
      { runValidators: true, new: true }
    );

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const mergeAndUpdateUser = async (userId, userInfo) => {

  try {

    const user = await UserModel.findById(userId);
    await updateMongoObject(userInfo, user);
    await user.save();

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const deleteUser = async (userId) => {

  try {

    await UserModel.deleteOne({ _id: userId });

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

module.exports = {
  createUser,
  deleteUser,
  getUsers,
  setUser,
  mergeAndUpdateUser,
  check: {
    userAuthorizationId: checkUserAuthorizationId,
    userValid: checkUserValid
  }
};
