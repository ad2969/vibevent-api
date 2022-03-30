const mongoose = require('mongoose');
const { isLng, isLat } = require('../../utils').validations;
const { LOCATION_TYPES } = require('../../constants').LOCATION;

// Based on mongoose docs (https://mongoosejs.com/docs/geojson.html)
// w/ added validation
exports.pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: LOCATION_TYPES,
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: (coords) => isLng(coords[0]) && isLat(coords[1]),
      message: (props) => `${props.value} is not a valid lng-lat coordinate!`
    }
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  location: {
    type: this.pointSchema,
  }
}, { _id: false });

locationSchema.index({ location: '2dsphere' }, { background: false });

exports.locationSchema = locationSchema;
