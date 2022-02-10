const express = require('express');
const router = express.Router();
const conversationSchema = require('../../models/conversation/conversation.model');
const userSchema = require('../../models/user/user.model');
const mongoose = require('mongoose');

router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    const conversation = await conversationSchema.where({"members._id": {"$in": [mongoose.Types.ObjectId(id)] }})
                                .select(`
                                  _id 
                                  name 
                                  members._id
                                  members.user_firstname
                                  members.user_lastname
                                  members.user_fullname
                                  members.user_avatar
                                  members.user_email
                                  members.user_phone
                                  members.user_background_color
                                  members.createdAt
                                  createdAt
                                `);

    if (conversation) {
      res.status(200).json({ conversation: conversation || [] });
      return;
    } 

    res.status(404).json({ message: 'Information is error' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

router.post('/get-conversation', async function (req, res) {
  try {
    const { members } = req.body;
    // get data from array condition
    const users = await userSchema.find({ _id: {'$in': members }})
                                    .select(`
                                    avatar
                                    background_image
                                    user_name
                                    background_color
                                    _id
                                    first_name
                                    last_name
                                    email_phone
                                    birthday
                                    createdAt
                                    updatedAt
                                  `);
                                                      // check [object] match [object]
    const conversation = await conversationSchema.findOne({ members: { $elemMatch: { _id: { $in: members } } } });

    if (Object.keys(conversation || {}).length > 0) {
      res.status(200).json({ status: 'success', conversation});
      return;
    }
    
    if (users.length > 0) {
      const responseConversation = new conversationSchema({ members: users });

      const conversations = await responseConversation.save();

      if (Object.keys(conversations).length > 0) {
        res.status(200).json({ status: 'success', conversations });
        return;
      } 
    }

    res.status(404).json({ message: 'Information is error' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

module.exports = router; 