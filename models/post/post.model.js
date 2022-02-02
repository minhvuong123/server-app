const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');
const commentSchema = require('../comment/comment.model');
const emojiSchema = require('../emoji/emoji.model');

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
    post_emojis: {
      type: [emojiSchema.schema],
      required: false,
      default: []
    },
    post_comments: {
      type: Array,
      required: false, // ['comment_id_1', 'comment_id_2']
      default: []
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Post', postSchema);