const _ = require('lodash');
const Categories = require('./lib/categories');

// TODO: Implement authorizations for who can edit categories

exports.queryCategories = async (req, res) => {

  try {

    const categoriesList = await Categories.getCategories();

    // Format the categories collection into { KEY: }
    const categories = _.reduce(categoriesList, (result, object) => {

      result[object.key] = object.name; // eslint-disable-line no-param-reassign
      return result;

    }, {});

    res.status(200).json(categories);

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.addCategory = async (req, res) => {

  try {

    const { categoryName: name, categoryKey: key } = req.body;

    const newCategory = await Categories.createCategory({ name, key });

    res.status(201).json({ categoryKey: newCategory.key });

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};

exports.deleteCategory = async (req, res) => {

  try {

    const { categoryKey: key } = req.params;

    // Check if category exists
    await Categories.check.categoryExists(key);

    // Finally, delete the event
    await Categories.deleteCategory(key);

    res.status(204).json();

  }
  catch (err) {

    res.status(err.status || 400).json(err);

  }

};
