const {
  verifyJwtToken,
  configToken
} = require('../utils');

function loginRequired(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized user!' })
  }
}

async function authorization(req, res, next) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT_Kiwi') {
    const token = req.headers.authorization.split(' ')[1]
    try {
      req.user = await verifyJwtToken(token, configToken.secretToken);
    } catch (error) {
      req.user = undefined;
    }
    next();
  } else {
    req.user = undefined;
    next();
  }
}

module.exports = {
  loginRequired,
  authorization
}