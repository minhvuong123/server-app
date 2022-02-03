const express = require('express');
const router = express.Router();
const postSchema = require('../../models/post/post.model');
const commentSchema = require('../../models/comment/comment.model');
const emojiSchema = require('../../models/emoji/emoji.model');

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

async function mappingComments(post_comment = [], comments = []) {
  if(comments.length > 0) {
    const responseComments = await commentSchema.find({ _id: { $in: comments }});

    post_comment.comments = responseComments;

    for(const comment of post_comment.comments) {
      await mappingComments(comment, comment.comments);
    }
  }
}

async function mappingPostComments(posts = [], comments = []) {
  if(comments.length > 0) {
    const responsePostComments = await commentSchema
                            .find({ _id: { $in: comments }})
                            .select(`
                              _id
                              comment_emojis
                              comment_text
                              comment_user
                              comments
                              createdAt
                              updatedAt
                            `);
    posts.post_comments = responsePostComments;

    for(const post_comment of posts.post_comments) {
      await mappingComments(post_comment, post_comment.comments);
    }
  }
}

router.get('/getPosts/user_id/:user_id/page/:page/limit/:limit', async function (req, res) {
  try {
    if(req.user) {
      const user_id = req.params.user_id;
      const page = +req.params.page - 1 >= 0 ? +req.params.page - 1 : 0;
      const limit = +req.params.limit || 10;
      const posts = await postSchema.find({ "post_user._id": user_id }).skip(page*limit).limit(limit);

      // map post_comments from [string_id] to [commentSchema]
      for(const post of posts) {
        await mappingPostComments(post, post.post_comments);
      }
      
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
      const responseComment = await comment.save();

      if(Object.keys(responseComment).length > 0) {
        const responsePost = await postSchema.updateOne( { _id },  { $push: { post_comments: comment._id }} );

        if(Object.keys(responsePost).length >= 3) {
          res.status(200).json({ message: "updated", comment });
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

      const responsePost = await postSchema.updateOne( { _id },  { $push: { post_emojis: emoji }} );

      if(Object.keys(responsePost).length >= 3) {
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

      const responsePost = await postSchema.updateOne( { _id },  { $pull: { post_emojis: { "emoji_user._id": user_id }} } );

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

router.post('/update-emoji', async function (req, res) {
  try {
    if(req.user) {
      const { _id, emoji_id, emoji_type } = req.body;

      const responsePost = await postSchema.updateOne( { _id, "post_emojis._id": emoji_id }, { $set: { "post_emojis.$.emoji_type": emoji_type } } );

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