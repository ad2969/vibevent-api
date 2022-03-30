const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
  },
  key: {
    type: String,
    trim: true,
    uppercase: true,
    required: true,
    unique: true,
    maxlength: 5
  }
});

exports.CategoryModel = mongoose.model('category', categorySchema);
