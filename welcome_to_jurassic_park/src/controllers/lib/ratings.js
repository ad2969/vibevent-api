const { EventModel } = require('../../models/event');
const { RatingModel } = require('../../models/collections/rating');

const errors = require('./_errors');

// ----
// ENDPOINTS
// ----

const deleteEventRatings = async (eventId) => {

  try {

    await RatingModel.deleteMany({ eventId });

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

const updateEventRating = async (eventId, userId, rating) => {

  try {

    // check if user has rated the event before
    let currentRating = await RatingModel.findOne({ userId, eventId });
    let currentRatingValue = 0;
    let countAdd = false;

    if (currentRating) {

      // update the rating if it already exists
      currentRatingValue = currentRating.value;
      currentRating.value = rating;
      countAdd = false;

    }
    else {

      // create new rating row if it does not exist yet
      currentRating = new RatingModel({ userId, eventId, value: rating });
      countAdd = true;

    }

    const eventUpdateOptions = { 'rating.sum': rating - currentRatingValue, 'rating.count': countAdd ? 1 : 0 };

    // save the new event and rating object
    await Promise.all([
      EventModel.findOneAndUpdate({ _id: eventId }, { $inc: eventUpdateOptions }),
      currentRating.save()
    ]);

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

module.exports = {
  deleteEventRatings,
  updateEventRating
};
