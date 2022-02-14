const express = require('express');
const router = express.Router();
const path = require('path');
const { rootPath } = require('../../utils');
const { nanoid } = require('nanoid');
const messageSchema = require('../../models/message/message.model');
const userSchema = require('../../models/user/user.model');
const imageSchema = require('../../models/images/images.model');

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

router.post('/send-message', async function (req, res) {
  try {
    if(req.user) {
      const { conversationId, senderId, text, images: message_images } = req.body;
      const images = [];
      const imageSchemaTemp = [];

      const messageModel = new messageSchema({ conversationId, senderId, text: text });
      
      if(message_images.length > 0) {
        for await (const message_image of message_images) {
          // init object Image
          const { file_data, file_name } = message_image;
          const base64Data = file_data.split(";base64,")[1];
          const names = file_name.split('.');
          const typeImage = names[names.length - 1];
          const imageName = nanoid(10);
          const saveUrl = `${path.join(rootPath, 'public/messages')}\\${imageName}.${typeImage}`;
          const imageUrl = `static/messages/${imageName}.${typeImage}`;
          await require("fs").writeFileSync(saveUrl, base64Data, 'base64');
          // init object Image

          const image = new imageSchema({ 
            images_user_id: messageModel.senderId, 
            images_message_id: messageModel._id, 
            images_url: imageUrl 
          });
          const responseImage = await image.save();
      
          if (Object.keys(responseImage).length > 0) {
            images.push(responseImage._id)
            imageSchemaTemp.push(image);
          }
        }
        messageModel.images = images;
      }

      const responseMessage = await messageModel.save();

      if (Object.keys(responseMessage).length > 0) {
        responseMessage.images = images;
        // map sender from string to friendSchema
        await mappingMessageSender(responseMessage, responseMessage.senderId);

        res.status(200).json({ status: 'success', message: responseMessage });
        return;
      } 
    }
    res.status(404).json({ message: 'Information is error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

async function mappingMessageSender(message, senderId) {
  message.sender = await userSchema.findOne({ _id: senderId})
                            .select(`
                              _id
                              first_name
                              last_name
                              avatar
                              background_image
                              user_name
                              email_phone
                              birthday
                              background_color
                              createdAt
                            `);
}

async function mappingMessageImages(message, images = []) {
  if(images.length > 0) {
    const responseImage = await imageSchema.find({ _id: { $in: images }});
    message.images = responseImage;
  }
}

router.post('/get-messages', async function (req, res) {
  try {
    if(req.user) {
      const { conversationId } = req.body;
      const responseMessages = await messageSchema.find({ conversationId });
      const messages = [...responseMessages];

      if(responseMessages.length > 0) {
        for await (const message of messages) {
          // map sender from string to friendSchema
          await mappingMessageSender(message, message.senderId);
          
          // map post_images from [image_id] to [imageSchema]
          await mappingMessageImages(message, message.images);
        }
      }
      res.status(200).json({ status: 'success', messages: messages || [] });
      return;
    }
    res.status(404).json({ message: 'Information is error' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
});

module.exports = router; 