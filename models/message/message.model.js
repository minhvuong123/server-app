
const mongoose = require("mongoose");
const userSchema = require('../user/user.model');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      require: true
    },
    sender: {
      type: userSchema.schema,
      require: true
    },
    text: {
      type: String,
      require: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);