const mongoose = require('mongoose');

const refreshToken = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('refreshToken', refreshToken);