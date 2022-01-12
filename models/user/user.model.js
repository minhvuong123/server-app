const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    background_image: {
      type: String,
      default: ''
    },
    email_phone: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    birthday: {
      type: String,
      required: true
    },
    background_color: {
      type: String,
      default: ''
    },
    friends: {
      type: [this.Schema],
      default: []
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('User', userSchema);