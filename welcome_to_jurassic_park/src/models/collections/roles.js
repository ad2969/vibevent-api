const mongoose = require('mongoose');
const { ROLES } = require('../../constants');

const ROLE_LIST = Object.values(ROLES.LIST);

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
    unique: true,
    required: true,
    enum: ROLE_LIST
  },
  permissions: [
    {
      type: String,
      uppercase: true,
      required: true
    }
  ]
}, { timestamps: true });

exports.RoleModel = mongoose.model('role', roleSchema);
