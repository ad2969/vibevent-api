const mongoose = require('mongoose');
const { imgSchema } = require('./schemas/image.js');
const { locationSchema } = require('./schemas/geo.js');
const { roomSchema } = require('./schemas/room');
const { validCategories } = require('../controllers/lib/categories').check;

const eventSchema = new mongoose.Schema({
  hosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  venue: {
    type: locationSchema,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
  },
  rating: {
    sum: {
      type: Number,
      min: 0,
      default: 0,
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    },
  },
  categories: {
    type: [String],
    validate: {
      validator: validCategories,
      message: 'One or more of the submitted values are not in the category list'
    },
  },
  links: [
    {
      url: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  media: {
    coverPhoto: {
      type: imgSchema,
    },
    hostPhotos: {
      type: [imgSchema],
    },
    userPhotos: {
      type: [imgSchema],
    }
  },
  tags: {
    hostTags: [
      {
        type: [String],
        trim: true,
        maxlength: 30
      }
    ],
    userTags: [
      {
        type: [String],
        trim: true,
        maxlength: 30
      }
    ]
  },
  rooms: {
    type: [roomSchema]
  }
}, { timestamps: true });

// Add validation for hosts (need at least one)
eventSchema.path('hosts').validate((hosts) => {

  if (!hosts) {

    return false;

  }
  if (hosts.length === 0) {

    return false;

  }
  return true;

}, 'Events need to have at least one assigned host');

exports.EventModel = mongoose.model('event', eventSchema);
