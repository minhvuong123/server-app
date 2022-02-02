const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');
const emojiSchema = require('../emoji/emoji.model');

const commentSchema = new mongoose.Schema(
  {
    comment_user: {
      type: friendSchema.schema,
      required: true,
      default: {}
    },
    comment_text: {
      type: String,
      required: true
    },
    comment_emojis: {
      type: [emojiSchema.schema],
      required: false,
      default: []
    },
    comments: {
      type: Array,
      required: false,
      default: [] // ['comment_id_1', 'comment_id_2']
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Comment', commentSchema);