const { MongoClient } = require('mongodb');

// VARS to connect to mongoose
const MONGO_CONTAINER = process.env.MONGO_CONTAINER || 'db';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_DB = process.env.MONGO_DB || 'event-discovery-api';
const MONGO_URI = `mongodb://${MONGO_CONTAINER}:${MONGO_PORT}`;

exports.init = async () => {

  try {

    const client = await MongoClient.connect(MONGO_URI, {
      useUnifiedTopology: true
    });
    return client;

  }
  catch (err) {

    throw err;

  }

};

exports.insertDocuments = async (collectionName, data) => {

  let client;
  let result;

  try {

    client = await this.init();
    const database = client.db(MONGO_DB);

    const collection = database.collection(collectionName);
    result = await collection.insertMany(data);

    if (result.result.n !== data.length || result.ops.length !== data.length) {

      throw new Error(`Something happened while inserting documents to mongo collection ${collectionName}`);

    }

  }
  catch (err) {

    console.debug(err);

  }
  finally {

    client.close();

  }

  return result;

};

exports.findDocuments = async (collectionName) => {

  let client;
  let result;

  try {

    client = await this.init();
    const database = client.db(MONGO_DB);

    const collection = database.collection(collectionName);
    result = await collection.find({}).toArray();

  }
  catch (err) {

    console.debug(err);

  }
  finally {

    client.close();

  }

  return result;

};

exports.deleteDocument = async (collectionName, indicator) => {

  let client;
  let result;

  try {

    client = await this.init();
    const database = client.db(MONGO_DB);

    const collection = database.collection(collectionName);
    result = await collection.deleteOne(indicator);

    if (result.result.n !== 1 && result.result.ok !== 1) {

      throw new Error(`Something happened while deleting documents in mongo collection ${collectionName}`);

    }

    return result;

  }
  catch (err) {

    console.debug(err);

  }
  finally {

    client.close();

  }

  return result;

};

exports.resetCollections = async () => {

  let client;

  try {

    client = await this.init();
    const database = client.db(MONGO_DB);

    const collections = await database.listCollections().toArray();
    await Promise.all(

      collections.map(({ name }) => (

        database.collection(name).deleteMany()

      ))

    );

  }
  catch (err) {

    console.debug(err);

  }
  finally {

    client.close();

  }

};
