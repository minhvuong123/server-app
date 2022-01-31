const express = require('express');
const router = express.Router();
const postSchema = require('../../models/post/post.model');

router.post('/', async function (req, res) {
  try {
    const { post_user, post_shared } = req.body;
    const post = new postSchema({ post_user, post_shared });

    const result = await post.save();

    if (Object.keys(result).length > 0) {
      res.status(200).json({ status: 'success' });
    } else {
      res.status(404).json({ message: 'Information is error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router; 