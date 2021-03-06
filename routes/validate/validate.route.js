const express = require('express');
const router = express.Router();

router.post('/', async function (req, res) {
  try {
    console.log('validate')
    if(req.user) {
      res.status(200).json({ status: 'success'});
      return;
    }
    res.status(204).json({ status: 'fault'});
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router; 