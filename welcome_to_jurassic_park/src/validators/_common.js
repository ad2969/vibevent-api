// IMPORT FROM CONTROLLERS LIB
const commonLib = require('../controllers/lib/_common').check;

const areMongoIds = async (ids) => {

  try {

    await Promise.all(ids.map((id) => commonLib.validId(id)));

  }
  catch (err) {

    throw err;

  }

};

const isNotEmpty = (array) => array.length > 0;

// EXPORTS

exports.areMongoIds = areMongoIds;
exports.isNotEmpty = isNotEmpty;
exports.isLongLat = commonLib.validCoordinates;
