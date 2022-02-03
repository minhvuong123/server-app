const express = require('express');
const router = express.Router();
const commentSchema = require('../../models/comment/comment.model');
const emojiSchema = require('../../models/emoji/emoji.model');

router.post('/addComment', async function (req, res) {
  try {
    if(req.user) {
      const { _id, comment_user, comment_text, } = req.body;
      const comment = new commentSchema({ comment_user, comment_text });

      const responseComment = await comment.save();

      if(Object.keys(responseComment).length > 0) {
        const responseUpdate = await commentSchema.updateOne( { _id },  { $push: { comments: comment._id }} );

        if(Object.keys(responseUpdate).length > 0) {
          res.status(200).json({ message: "success", comment });
          return;
        }
      }

    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/emoji', async function (req, res) {
  try {
    if(req.user) {
      const { _id, emoji_user, emoji_type } = req.body;

      const emoji = new emojiSchema({ emoji_user, emoji_type });

      const responseComment = await commentSchema.updateOne( { _id },  { $push: { comment_emojis: emoji }} );

      if(Object.keys(responseComment).length >= 3) {
        res.status(200).json({ message: "updated", emoji });
        return;
      }
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/remove-emoji', async function (req, res) {
  try {
    if(req.user) {
      const { _id, user_id } = req.body;

      const responseComment = await commentSchema.updateOne( { _id },  { $pull: { comment_emojis: { "emoji_user._id": user_id }} } );

      if(Object.keys(responseComment).length >= 3) {
        res.status(200).json({ message: "updated" });
        return;
      }
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/update-emoji', async function (req, res) {
  try {
    if(req.user) {
      const { _id, emoji_id, emoji_type } = req.body;

      const responsePost = await commentSchema.updateOne( { _id, "comment_emojis._id": emoji_id }, { $set: { "comment_emojis.$.emoji_type": emoji_type } } );

      if(Object.keys(responsePost).length >= 3) {
        res.status(200).json({ message: "updated" });
        return;
      }
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})


module.exports = router; 