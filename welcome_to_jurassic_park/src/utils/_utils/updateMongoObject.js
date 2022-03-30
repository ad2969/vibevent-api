const _ = require('lodash');

const traverseArray = async (arr, mongooseObj, path = '') => {

  try {

    _.forEach(arr, (el, index) => {

      const currentPath = `${path}[${index}]`; // Ignore that the first element in path might be an array

      if (_.isArray(el)) {

        traverseArray(el, mongooseObj, currentPath);

      }
      else if (_.isObject(el)) {

        // since it is a mutually recursive function, we need to disable lint here
        // eslint-disable-next-line
        traverseObject(el, mongooseObj, currentPath);

      }
      else if (!_.isNil(el)) {

        // get the array itself
        let existingArray = _.get(mongooseObj, path);
        if (existingArray) existingArray = JSON.parse(JSON.stringify(existingArray));
        else existingArray = [];

        // avoid merges by doing the following
        const newArray = _.union(existingArray, [el]);
        // finally, set the value
        _.set(mongooseObj, path, newArray);

      }

    });

  }
  catch (err) {

    throw err;

  }

};

const traverseObject = async (obj, mongooseObj, path = '') => {

  try {

    _.forIn(obj, (val, key) => {

      const currentPath = path ? `${path}.${key}` : key; // Consider that starting path with ".*" will not work

      if (_.isArray(val)) {

        // since it is a mutually recursive function, we need to disable lint here
        // eslint-disable-next-line
          traverseArray(obj[key], mongooseObj, currentPath);

      }
      else if (_.isObject(val)) {

        traverseObject(obj[key], mongooseObj, currentPath);

      }
      else if (!_.isNil(val)) {

        _.set(mongooseObj, currentPath, val);

      }

    });

  }
  catch (err) {

    throw err;

  }

};

/**
 * Uses a recursive method to update largely nested objects
 * The function will NOT overwrite the existing lists (arrays, object lists, etc),
 * it will instead merge what is received in 'merge' with the 'output' object
 * The function aims to abstract the way 'USERS' will update data in a PATCH request.
 * As opposed to 'HOSTS', 'USERS' will often have to send incomplete data (only certain fields)
 * Thus, there needs to be a robust way to make sure that nothing unwanted is overwritten.
 * @param {object} merge - data to be updated into the DB
 * @param {object} output - object containing the existing data
 */

module.exports = async (merge, output) => {

  try {

    if (!output) throw new Error('Error updating mongoose object - none was received');
    if (_.isEmpty(merge)) return output;
    await traverseObject(merge, output);
    return output;

  }
  catch (err) {

    throw err;

  }

};
