const express = require('express');
const router = express.Router();
const path = require('path');
const { rootPath } = require('../../utils');
const { nanoid } = require('nanoid');
const postSchema = require('../../models/post/post.model');
const commentSchema = require('../../models/comment/comment.model');
const emojiSchema = require('../../models/emoji/emoji.model');
const imageSchema = require('../../models/images/images.model');

router.post('/add-post', async function (req, res) {
  try {
    if(req.user) {
      const { post_user, post_shared, post_text, post_images } = req.body;
      const images = [];
      const imageSchemaTemp = [];

      const post = new postSchema({ post_user, post_shared, post_text });

      if(post_images.length > 0) {
        for await (const post_image of post_images) {
          // init object Image
          const { file_data, file_name } = post_image;
          const base64Data = file_data.split(";base64,")[1];
          const names = file_name.split('.');
          const typeImage = names[names.length - 1];
          const imageName = nanoid(10);
          const saveUrl = `${path.join(rootPath, 'public/posts')}\\${imageName}.${typeImage}`;
          const imageUrl = `static/posts/${imageName}.${typeImage}`;
          await require("fs").writeFileSync(saveUrl, base64Data, 'base64');
          // init object Image

          const image = new imageSchema({ images_user_id: post_user._id, images_post_id: post._id, images_url: imageUrl });
          const responseImage = await image.save();
      
          if (Object.keys(responseImage).length > 0) {
            images.push(responseImage._id)
            imageSchemaTemp.push(image);
          }
        }
        post.post_images = images;
      }

      const result = await post.save();

      if (Object.keys(result).length > 0) {
        result.post_images = imageSchemaTemp;
        res.status(200).json({ status: 'success', post: result });
        return;
      }
    }
    res.status(404).json({ message: 'Information is error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

async function mappingComments(post_comments = [], comments = []) {
  if(comments.length > 0) {
    const responseComments = await commentSchema.find({ _id: { $in: comments }});

    post_comments.comments = responseComments;

    for(const comment of post_comments.comments) {
      await mappingComments(comment, comment.comments);
    }
  }
}

async function mappingPostComments(post, comments = []) {
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
    post.post_comments = responsePostComments;

    for(const post_comment of post.post_comments) {
      await mappingComments(post_comment, post_comment.comments);
    }
  }
}

async function mappingPostImage(post, images = []) {
  if(images.length > 0) {
    const responseImage = await imageSchema.find({ _id: { $in: images }});
    post.post_images = responseImage;
  }
}

router.get('/get-posts/user_id/:user_id/page/:page/limit/:limit', async function (req, res) {
  try {
    if(req.user) {
      const user_id = req.params.user_id;
      const page = +req.params.page - 1 >= 0 ? +req.params.page - 1 : 0;
      const limit = +req.params.limit || 10;
      let posts = [];

      if(user_id && user_id !== "undefined") { // get post random for own user
        posts = await postSchema.find({ "post_user._id": user_id }).skip(page*limit).limit(limit);
      } else { // get post random for everyone
        posts = await postSchema.find().skip(page*limit).limit(limit);
      }

      // map post_comments from [string_id] to [commentSchema]
      for(const post of posts) {
        await mappingPostComments(post, post.post_comments);
        // map post_images from [image_id] to [imageSchema]
        await mappingPostImage(post, post.post_images);
      }
      
      res.status(200).json({ posts: posts });
      return;
    }
    res.status(404).json({ message: 'Contact admin to helping!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

async function removePostComments(comments = []) {
  if(comments.length > 0) {
    for(const commentId of comments) {
      const responseComment = await commentSchema.findOne({ _id: commentId });
      await commentSchema.deleteOne({ _id: commentId });

      if(responseComment.comments.length > 0) {
        await removePostComments(responseComment.comments);
      }
    }
  }
}

router.post('/remove-post', async function (req, res) {
  try {
    if(req.user) {
      const { _id } = req.body;
      const post = await postSchema.findOne({ _id });
      const responsePost = await postSchema.deleteOne({ _id });

      if(post.post_comments.length > 0) {
        await removePostComments(post.post_comments);
      }

      if (responsePost.deletedCount > 0) {
        res.status(200).json({ status: 'removed' });
        return;
      }
    }
    res.status(404).json({ message: 'Information is error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/comment', async function (req, res) {
  try {
    if(req.user) {
      const { _id, comment_user, comment_text } = req.body;

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