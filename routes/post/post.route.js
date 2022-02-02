const express = require('express');
const router = express.Router();
const postSchema = require('../../models/post/post.model');
const commentSchema = require('../../models/comment/comment.model');

router.post('/addPost', async function (req, res) {
  try {
    if(req.user) {
      const { post_user, post_shared, post_text } = req.body;
      const post = new postSchema({ post_user, post_shared, post_text });

      const result = await post.save();

      if (Object.keys(result).length > 0) {
        res.status(200).json({ status: 'success' });
        return;
      }
    }
    res.status(404).json({ message: 'Information is error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/getPosts/user_id/:user_id/page/:page/limit/:limit', async function (req, res) {
  try {
    if(req.user) {
      const user_id = req.params.user_id;
      const page = +req.params.page - 1 >= 0 ? +req.params.page - 1 : 0;
      const limit = +req.params.limit || 10;
      const posts = await postSchema.find({ "post_user._id": user_id }).skip(page*limit).limit(limit);

      res.status(200).json({ posts: posts });
      return;
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/comment', async function (req, res) {
  try {
    if(req.user) {
      const { _id, comment_user, comment_text, } = req.body;
      const comment = new commentSchema({ comment_user, comment_text });
      const result = await postSchema.updateOne( { _id },  { $push: { post_comments: comment }} );

      if(Object.keys(result).length >= 3) {
        res.status(200).json({ message: "updated", comment });
        return;
      }
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})


module.exports = router; 