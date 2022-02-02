const express = require('express');
const router = express.Router();
const commentSchema = require('../../models/comment/comment.model');

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


module.exports = router; 