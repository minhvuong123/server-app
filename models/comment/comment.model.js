const mongoose = require('mongoose');
const friendSchema = require('../friend/friend.model');

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
    emojis: {
      type: Array,
      required: false,
      default: [] // { user, type: [like, heart, care, haha, wow, sad, angry] }
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