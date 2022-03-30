const _ = require('lodash');
const Users = require('./lib/users');
const Events = require('./lib/events');
const Ratings = require('./lib/ratings');

exports.queryEvents = async (req, res) => {

  try {

    const {
      withHosts,
      name,
      results,
      coordinates,
      radius = 1000
    } = req.query;

    const options = {
      limit: results,
      withHosts,
      location: { coordinates, radius },
      filters: {
        name: { $regex: name, $options: 'i' }
      }
    };

    const events = await Events.getEvents('all', options);

    const eventsById = _.keyBy(events, '_id');

    res.status(200).json(eventsById);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.queryEventsByIds = async (req, res) => {

  try {

    const { withHosts } = req.query;
    const { eventIds } = req.params;

    const events = await Events.getEvents(eventIds, { withHosts });

    const eventsById = _.keyBy(events, '_id');

    res.status(200).json(eventsById);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.createEvent = async (req, res) => {

  try {

    const {
      hosts,
      coverPhoto,
      media,
      tags,
      ...eventInfo
    } = req.body;

    const { id: authorizationId } = req.user;

    // Do checks
    if (!req.admin) await Events.check.authorizationIdInHosts(hosts, authorizationId);
    // Check the userIds in hosts
    await Promise.all(hosts.map((host) => Users.check.userValid(host)));

    const eventBody = {
      ...eventInfo,
      // rating should be initialized to zero
      rating: {
        sum: 0,
        count: 0
      },
      hosts,
      media: { coverPhoto, hostPhotos: media },
      tags: { hostTags: tags }
    };

    const result = await Events.createEvent(eventBody);

    res.status(201).json({ eventId: result._id });

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.contributeEventRating = async (req, res) => {

  try {

    const { eventId } = req.params;
    const { userId, rating } = req.body;

    // Do checks
    await Promise.all([
      Events.check.eventValid(eventId), // Check the eventId
      Users.check.userValid(userId) // Check the userId
    ]);

    await Ratings.updateEventRating(eventId, userId, rating);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.updateEventHost = async (req, res) => {

  try {

    const { eventId } = req.params;
    const { hosts } = req.body;
    const { id: authorizationId } = req.user;

    // Do checks
    await Promise.all([
      Events.check.eventValid(eventId), // Check the eventId
      Promise.all(hosts.map((host) => Users.check.userValid(host))) // Check the userIds
    ]);

    let eventHosts = [];
    if (!req.admin) eventHosts = (await Events.check.userHostOfEvent(eventId, authorizationId)).map((id) => String(id)); // Check if the user is authorized
    else eventHosts = (await Events.getEvents([eventId]))[0].hosts;

    // distribute the hosts removed/added
    const addedHosts = hosts.filter((host) => !eventHosts.includes(host));
    const removedHosts = eventHosts.filter((eventHost) => !hosts.includes(eventHost));

    // Finally, update the event and user
    await Promise.all([

      Events.setEvent(eventId, { hosts }), // Set event 'hosts'
      Promise.all(addedHosts.map(async (host) => {

        const user = (await Users.getUsers(host))[0];
        // for addedhosts, add the event to the list of createdEvents
        const eventsCreated = user.eventsCreated.map((id) => String(id));
        if (!eventsCreated.includes(eventId)) eventsCreated.push(eventId);
        await Users.setUser(host, { eventsCreated }); // Add event to user

      })),
      Promise.all(removedHosts.map(async (host) => {

        const user = (await Users.getUsers(host))[0];
        // for removedHosts, remove the event from the list of createdEvents
        const eventsCreated = user.eventsCreated.map((id) => String(id)).filter((event) => event !== eventId);
        await Users.setUser(host, { eventsCreated }); // Add event to user

      }))

    ]);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

// SET (PUT)
exports.setEventById = async (req, res) => {

  try {

    const { eventId } = req.params;

    const { id: authorizationId } = req.user;

    // Do checks
    await Events.check.eventValid(eventId); // Check if event exists
    if (!req.admin) await Events.check.userHostOfEvent(eventId, authorizationId); // Check if the user is authorized

    // Finally, update the event
    await Events.setEvent(eventId, req.body);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.deleteEventById = async (req, res) => {

  try {

    const { eventId } = req.params;

    const { id: authorizationId } = req.user;

    // Do checks
    await Events.check.eventValid(eventId); // Check if event exists
    if (!req.admin) await Events.check.userHostOfEvent(eventId, authorizationId); // Check if the user is authorized

    // Finally, delete the event and all related collections
    await Promise.all([
      Events.deleteEvent(eventId),
      Ratings.deleteEventRatings(eventId)
    ]);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.checkEventUserAuthorized = async (req, res) => {

  try {

    const { id: mongoId } = req.user;
    const { eventId } = req.params;

    let isAuthorized = false;

    try {

      await Events.check.userHostOfEvent(eventId, mongoId);
      isAuthorized = true;

    }
    catch (err) {

      isAuthorized = false;

    }

    res.status(200).json({ user_authorized: isAuthorized });

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};
