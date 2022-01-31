const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');
const commentSchema = require('../comment/comment.model');

const postSchema = new mongoose.Schema(
  {
    post_user: {
      type: friendSchema.schema,
      required: true,
      default: {}
    },
    post_shared: {
      type: String, // [ public, private ]
      required: true
    },
    comments: {
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