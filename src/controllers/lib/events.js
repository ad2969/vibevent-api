const _ = require('lodash');
const { EventModel } = require('../../models/event');
const { dataFilter: eventDataFilter } = require('../../constants').MONGOOSE;
const { updateMongoObject } = require('../../utils');
const errors = require('./_errors');
const Common = require('./_common');

const { APIError } = errors;

// ----
// CHECKS
// ----

const checkAuthorizationIdInHosts = async (hosts, authorizationId) => {

  try {

    // Check that the id passed into Authorization header is one of the event hosts
    if (!hosts.includes(authorizationId)) {

      throw new APIError('Sorry! your authorization id isn\'t included in the event\'s host list', 403, 'ErrorInvalidHost');

    }

  }
  catch (err) {

    throw err;

  }

};

const checkEventValid = async (eventId) => {

  try {

    const event = await EventModel.findById(eventId).lean();
    if (_.isEmpty(event)) throw new APIError(errors.eventDoesNotExist(eventId), 404, 'ErrorEventDoesNotExist');

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

const checkUserHostOfEvent = async (eventId, userId) => {

  try {

    if (!userId) throw new APIError(errors.ErrorUnauthorizedEventChange, 403, 'ErrorNotAuthorizedEventChange');

    // get the event
    const { hosts: eventHosts } = await EventModel.findById(eventId).lean();
    const eventHostList = JSON.stringify(eventHosts);

    // check if the user is a host of the event
    if (!_.includes(eventHostList, userId)) throw new APIError(errors.ErrorUnauthorizedEventChange, 403, 'ErrorNotAuthorizedEventChange');

    return eventHosts;

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

// ----
// ENDPOINTS
// ----
const getEvents = async (ids, options = {}) => {

  try {

    const { withHosts, filters = {}, location } = options;
    let eventIds = ids;

    let events = EventModel.find(filters);

    if (eventIds !== 'all') {

      if (!_.isArray(eventIds)) eventIds = [eventIds];

      // Remove invalid ids from the array
      const filteredIds = await Common.removeInvalidIds(eventIds);

      events = events.where('_id').in(filteredIds);

    }
    events = events.select(eventDataFilter);
    if (options.limit) events = events.limit(options.limit);
    if (withHosts) events = events.populate('hosts');

    if (location && location.coordinates) {

      events = events
        .where('venue.location')
        .near({
          center: location.coordinates,
          maxDistance: location.radius,
          spherical: true
        });

    }

    events = await events.lean().exec();

    return events;

  }
  catch (err) {

    // Special case (if eventIds are invalid/not found, return an empty object instead of an error)
    if (err.errmsg === 'CastError') return {};
    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const createEvent = async (eventInfo) => {

  try {

    const eventData = eventInfo;
    await updateMongoObject(eventData, {});

    const newEvent = new EventModel(eventData);
    const result = await newEvent.save();

    return result;

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const setEvent = async (eventId, eventInfo) => {

  try {

    await EventModel.findOneAndUpdate(
      { _id: eventId },
      eventInfo,
      { runValidators: true, new: true }
    );

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const mergeAndUpdateEvent = async (eventId, eventInfo) => {

  try {

    const event = await EventModel.findById(eventId);
    await updateMongoObject(eventInfo, event);

    await event.save();

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

const deleteEvent = async (eventId) => {

  try {

    await EventModel.deleteOne({ _id: eventId });

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw new APIError(err.message, 400);

  }

};

module.exports = {
  // Basic functionality
  createEvent,
  deleteEvent,
  getEvents,
  setEvent,
  mergeAndUpdateEvent,

  // Checks
  check: {
    authorizationIdInHosts: checkAuthorizationIdInHosts,
    eventValid: checkEventValid,
    userHostOfEvent: checkUserHostOfEvent
  }
};
