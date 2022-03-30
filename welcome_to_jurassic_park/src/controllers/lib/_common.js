const { Types } = require('mongoose');
const errors = require('./_errors');
const { isLat, isLng } = require('../../utils').validations;

const { APIError } = errors;

// ----
// CHECKS
// ----
const checkValidId = async (id) => {

  try {

    if (!Types.ObjectId.isValid(id)) throw new APIError(errors.ErrorInvalidId, 400, 'ErrorInvalidId');

  }
  catch (err) {

    throw err;

  }

};

const checkValidCoordinates = async (coordinates) => {

  try {

    if (!isLng(coordinates[0]) || !isLat(coordinates[1])) throw new APIError(errors.ErrorInvalidLocation, 400, 'ErrorInvalidLocation');

  }
  catch (err) {

    throw err;

  }

};

const removeInvalidIds = async (ids) => {

  const filteredIds = ids.filter((id) => {

    if (Types.ObjectId.isValid(id)) return true;

    return false;

  });

  return filteredIds;

};

module.exports = {
  check: {
    validId: checkValidId,
    validCoordinates: checkValidCoordinates,
  },
  removeInvalidIds
};
