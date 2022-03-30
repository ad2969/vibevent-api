const _ = require('lodash');
const { CategoryModel } = require('../../models/category');
const errors = require('./_errors');

// ----
// CHECKS
// ----

// throws 404 'not found' error if not found
const checkCategoryExists = async (key) => {

  try {

    const check = await CategoryModel.find({ key });

    if (_.isEmpty(check)) throw new errors.APIError(errors.categoryDoesNotExist(key), 404);

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

// throws 400 'not in list' error if not found
const checkValidCategories = async (categories) => {

  try {

    let validate = true;

    const checks = await Promise.all(
      categories.map((categoryKey) => CategoryModel.findOne({ key: categoryKey }))
    );

    if (checks.some((check) => !check)) validate = false;

    if (!validate) throw new errors.APIError(errors.ErrorInvalidCategory, 400, 'ErrorInvalidCategory');

  }
  catch (err) {

    throw err;

  }

};

// ----
// ENDPOINTS
// ----
const getCategories = async () => {

  try {

    const categories = await CategoryModel.find().lean();
    return categories;

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};
const createCategory = async (categoryInfo) => {

  try {

    const { name, key } = categoryInfo;

    const newCategory = new CategoryModel({ name, key });

    const result = await newCategory.save();

    return result;

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

const deleteCategory = async (key) => {

  try {

    await CategoryModel.deleteOne({ key });

  }
  catch (err) {

    if (err.errmsg) errors.handleMongoError(err);
    throw err;

  }

};

module.exports = {
  createCategory,
  deleteCategory,
  getCategories,
  check: {
    categoryExists: checkCategoryExists,
    validCategories: checkValidCategories
  }
};
