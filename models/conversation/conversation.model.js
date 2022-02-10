const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');

const ConversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ''
    },
    members: {
      type: [friendSchema.schema],
      require: true,
      default: []
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);