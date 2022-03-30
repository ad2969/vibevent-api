const mongoose = require('mongoose');
const { isEmail } = require('../utils').RX;
const { imgSchema } = require('./schemas/image.js');
const { ROLES } = require('../constants');

const ROLE_LIST = Object.values(ROLES.LIST);

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ROLE_LIST,
    default: ROLES.DEFAULT
  },
  firstName: {
    type: String,
    trim: true,
    alias: 'name',
    required: true
  },
  lastName: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email address!`
    },
  },
  username: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true // unique if not null
  },
  profilePhoto: {
    type: imgSchema,
    // TODO: need a proper default
  },
  eventsInvolved: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
  ],
  eventsCreated: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
  ],
  eventsSaved: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'event' }
  ],
}, { timestamps: true });

// Virtuals
userSchema.virtual('fullName').get(() => `${this.name.firstName} ${this.name.lastName}`);

exports.UserModel = mongoose.model('user', userSchema);
