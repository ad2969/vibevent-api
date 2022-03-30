const mongoose = require('mongoose');

exports.roomSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  }
}, { _id: false });
