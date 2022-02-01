const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { configToken, removeAccents } = require('../../utils');
const { TinyColor } = require('@ctrl/tinycolor');
const { random } = require('@ctrl/tinycolor');
const userSchema = require('../../models/user/user.model');
const refreshTokenSchema = require('../../models/refreshToken/refreshToken.model');

router.post('/addFriend', async function (req, res) {
  try {
    const { userId, friendId } = req.body;
    const friend = await userSchema.findOne({ _id: { $eq: friendId} })
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
                                    `);

    await userSchema.updateOne( { _id: userId },  { $push: { friends: { ...friend } }} )

    res.status(200).json({ status: 'success'});
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/suggest', async function (req, res) {
  try {
    const { userId, limit } = req.body;
    const tempFriends = [];
    const user = await userSchema.findOne({ _id: userId }).select(`friends._id`);
    tempFriends.push(userId);

    user.friends.forEach(friend => {
      tempFriends.push(friend._id)
    })

    const friends = await userSchema.find({ _id: { $nin: tempFriends }})
                                  .select(`
                                    _id
                                    avatar
                                    background_image
                                    background_color
                                    user_name
                                    first_name
                                    last_name
                                  `)
                                  .limit(limit);
    res.status(200).json({ friends });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/filter', async function (req, res) {
  try {
    const stringText = req.body.value;

    const searchObject = {
      '$or': [
        { user_firstname: {  $regex: '.*' + stringText + '.*', $options: 'i' } },
        { user_lastname: {  $regex: '.*' + stringText + '.*', $options: 'i' } },
        { user_fullname: {  $regex: '.*' + stringText + '.*', $options: 'i' } },
        { user_email: { $regex: '.*' + stringText + '.*', $options: 'i' } }
      ]
    }
    const users = await userSchema.where(searchObject);
    const usersResult = users.map(user => {
      return {
        _id: user._id,
        user_fullname: user.user_fullname,
        user_avatar: user.user_avatar,
        user_email: user.user_email
      }
    });

    res.status(200).json({
      users: usersResult || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})


// router.post('/', async function (req, res) {
//   try {
//     const base64Data = req.body.user.user_image_base64.split(";base64,")[1];
//     const exten = req.body.typeImage;
//     const imageName = uuid();
//     const saveUrl = `${path.join(rootPath, 'public/images')}\\${imageName}.${exten}`;
//     req.body.user.image_url = base64Data ? `static/images/${imageName}.${exten}` : '';

//     const { 
//       user_email,
//       user_phone,
//       user_password,
//       user_role
//     } = req.body.user;

//     if (base64Data) {
//       require("fs").writeFile(saveUrl, base64Data, 'base64', async function (err) {
//         if (!err) {
//           const user = new userSchema({ user_email, user_phone, user_password, user_role });
//           const result = await user.save();
          
//           res.status(200).json({  user: result });
//         }
//       });
//     } else {
//       const user = new userSchema({ user_email, user_phone, user_password, user_role });

//       const result = await user.save();
//       res.status(200).json({ user: result });
//     }

//   } catch (error) {
//     res.status(500).json({ message: 'Server error' })
//   }
// })


// router.patch('/', async function (req, res) {
//   try {
//     if (req.body.user.user_image_base64) {
//       const base64Data = req.body.user.user_image_base64.split(";base64,")[1];
//       const exten = req.body.typeImage;
//       const imageName = uuid();
//       const saveUrl = `${path.join(rootPath, 'public/images')}\\${imageName}.${exten}`;
//       req.body.user.image_url = `static/images/${imageName}.${exten}`;

//       delete req.body.user.user_image_base64;
//       delete req.body.user.status;

//       require("fs").writeFile(saveUrl, base64Data, 'base64', async function (err) {
//         if (!err) {
//           const user = await userSchema.where({ _id: req.body.user._id }).updateOne({ ...req.body.user })
//           if (user.ok === 1) {
//             res.status(200).json({ status: 'ok', image_url: req.body.user.image_url });
//           }
//         }
//       });
//     } else {
//       const user = await userSchema.where({ _id: req.body.user._id }).updateOne({ ...req.body.user });

//       if (user.ok === 1) {
//         res.status(200).json({ status: 'ok',  image_url: req.body.user.image_url });
//       }
//     }

//   } catch (error) {
//     res.status(500).json({ status: 'Server error' });
//   }
// })

router.post('/register', async function (req, res) {
  try {
    const { 
      first_name, 
      last_name, 
      avatar = '', 
      background_image = '',
      email_phone,
      password,
      birthday,
    } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    let color = new TinyColor(random().originalInput);

    while (color.isLight()) {
      color = new TinyColor(random().originalInput);
    }
    
    const user_name = `${removeAccents(first_name)}.${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

    const user = new userSchema({ 
      first_name, 
      last_name, 
      avatar, 
      background_image, 
      user_name,
      email_phone, 
      password: passwordHash, 
      birthday,
      background_color: `#${color.toHex()}` 
    });

    const result = await user.save();

    if (Object.keys(result).length > 0) {
      res.status(200).json({ status: 'success' });
    } else {
      res.status(404).json({ message: 'Information is error' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/sign-in', async function (req, res, next) {
  try {
    const { 
      email_phone,
      password
     } = req.body;
    const user = await userSchema.where({ email_phone }).findOne();

    if (Object.keys(user).length > 0) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const userPopulate = {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
          background_image: user.background_image,
          user_name: user.user_name,
          email_phone: user.email_phone,      
          birthday: user.birthday,      
          background_color: user.background_color,      
          createdAt: user.createdAt
        };

        const token = jwt.sign({...userPopulate}, configToken.secretToken, { expiresIn: configToken.tokenLife });
        const refreshTokenExist = await refreshTokenSchema.findOne({user_id: user._id});
        let refreshToken = '';
        
        if (!refreshTokenExist || Object.keys(refreshTokenExist) <= 0) {
          refreshToken = jwt.sign({...userPopulate}, configToken.refreshTokenSecret);

          // save refresh token into db
          const refreshTokenModel = new refreshTokenSchema({ user_id: user._id, token: refreshToken });
          await refreshTokenModel.save();
        } else {
          refreshToken = refreshTokenExist.token;
        }
        
        res.status(200).json({ message: 'success', token, refreshToken, user: userPopulate });
        return;
      }
    }
    res.status(404).json({ message: 'Login fault with this user. Please check it again or contact to admin for help !' });
    return;

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
})

router.post('/refresh', async function (req, res, next) {
  try {
    const { refreshToken } = req.body;
    const refreshTokenModel = await refreshTokenSchema.where({ token: refreshToken }).findOne().select(`user_id`);

    if(refreshTokenModel && refreshTokenModel.user_id) {
      const user = await userSchema.where({ _id: refreshTokenModel.user_id }).findOne();
      const userPopulate = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        background_image: user.background_image,
        user_name: user.user_name,
        email_phone: user.email_phone,      
        birthday: user.birthday,      
        background_color: user.background_color,      
        createdAt: user.createdAt
      };

      const token = jwt.sign({...userPopulate}, configToken.secretToken, { expiresIn: configToken.tokenLife });
      res.status(200).json({ status: 'success', token, refreshToken, user: userPopulate });
      return;
    }

    res.status(404).json({ status: 'fault' });
    return;

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
})


router.post('/delete', async function (req, res) {
  try {
    const _id = req.body.user._id;
    const result = await userSchema.deleteOne({ _id });

    if (result.deletedCount >= 1) {
      res.status(200).json({ status: 'ok' });
      return;
    }

    res.status(404).json({ status: 'fault' });
    return;
  } catch (error) {
    res.status(500).json({ message: 'server error' })
  }
})

module.exports = router; 