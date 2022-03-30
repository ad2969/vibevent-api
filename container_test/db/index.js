const mongo = require('./mongodb');

const { insertDocuments, deleteDocument } = mongo;

exports.postEvent = async (eventInfo) => {

  const result = await insertDocuments('events', [eventInfo]);

  let eventId;
  if (result) {

    eventId = result.ops && result.ops[0] && result.ops[0]._id;

  }
  return { eventId };

};

exports.deleteEvent = async (eventId) => {

  const result = await deleteDocument('events', { _id: eventId });
  return result;

};

exports.postUser = async (userInfo) => {

  const result = await insertDocuments('users', [userInfo]);

  let userId;
  if (result) {

    userId = result.ops && result.ops[0] && result.ops[0]._id;

  }
  return { userId };

};

exports.deleteUser = async (userId) => {

  const result = await deleteDocument('users', { _id: userId });
  return result;

};

exports.postCategory = async (categoryInfo) => {

  const result = await insertDocuments('categories', [categoryInfo]);

  let categoryKey;
  if (result) {

    categoryKey = result.ops && result.ops[0] && result.ops[0].key;

  }
  return { categoryKey };

};

exports.deleteCategory = async (categoryKey) => {

  const result = deleteDocument('categories', { key: categoryKey });
  return result;

};
