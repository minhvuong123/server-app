const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');

const emojiSchema = new mongoose.Schema(
  {
    emoji_user: {
      type: friendSchema.schema,
      required: false,
      default: {}
    },
    emoji_type: {
      type: String,
      required: false,
      default: ''
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Emoji', emojiSchema);