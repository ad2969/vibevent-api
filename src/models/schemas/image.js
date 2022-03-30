const mongoose = require('mongoose');

exports.imgSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  size: {
    width: Number,
    height: Number,
  }
}, { _id: false });
