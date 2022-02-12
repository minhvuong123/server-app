
const mongoose = require("mongoose");
const friendSchema = require('../friend/friend.model');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      require: true
    },
    senderId: {
      type: String,
      require: true
    },
    sender: {
      type: Object,
      require: false,
      default: {}
    },
    images: {
      type: Array,
      require: false, // [image_id]
      default: []
    },
    text: {
      type: String,
      require: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);