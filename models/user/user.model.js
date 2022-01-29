const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');

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
    user_name: {
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
      type: [friendSchema.schema],
      default: []
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('User', userSchema);