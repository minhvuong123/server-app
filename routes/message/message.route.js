const express = require('express');
const router = express.Router();
const messageSchema = require('../../models/message/message.model');
const userSchema = require('../../models/user/user.model');
const mongoose = require('mongoose');

router.get('/:id', async function (req, res) {
  try {
    const { id } = req.params;

    const messages = await messageSchema.find({ conversationId: id })
                    .select(`
                      conversationId 
                      text 
                      createdAt
                      sender._id
                      sender.user_firstname
                      sender.user_lastname
                      sender.user_fullname
                      sender.user_avatar
                      sender.user_email
                      sender.user_phone
                      sender.user_background_color
                      sender.createdAt
                    `);

    if (messages) {
      res.status(200).json({ messages });
      return;
    } 

    res.status(404).json({ message: 'Information is error' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

router.post('/', async function (req, res) {
  try {
  
    const { conversationId, senderId, text } = req.body.message;

    const user = await userSchema.findOne({ _id: mongoose.Types.ObjectId(senderId)})

    if (user) {
      const messageModel = new messageSchema({ conversationId, sender: user, text });

      const result = await messageModel.save();

      if (Object.keys(result).length > 0) {
        res.status(200).json({ status: 'success' });
        return;
      } 
    }
  
    res.status(404).json({ message: 'Information is error' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

module.exports = router; 