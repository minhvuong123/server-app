
const jwt = require('jsonwebtoken');
const { configToken, verifyJwtToken } = require('../utils');

function loginRequired(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' })
  }
}

async function authorization(req, res, next) {
  try {
    req.user = await verifyJwtToken(req.headers.authorization, configToken.secretToken);
  } catch (error) {
    req.user = undefined;
  }

  next();
}

module.exports = {
  loginRequired,
  authorization
}