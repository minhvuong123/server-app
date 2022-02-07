const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    images_user_id: {
      type: String,
      required: true,
      default: ''
    },
    images_url: {
      type: String,
      required: false,
      default: ''
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Image', imageSchema);