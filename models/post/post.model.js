const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');
const commentSchema = require('../comment/comment.model');

const postSchema = new mongoose.Schema(
  {
    post_user: {
      type: friendSchema.schema,
      required: true
    },
    post_shared: {
      type: String, // [ public, private ]
      required: true
    },
    post_text: {
      type: String,
      require: true
    },
    post_comments: {
      type: [commentSchema.schema],
      required: false,
      default: []
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Post', postSchema);