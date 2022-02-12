const jwt = require('jsonwebtoken');

const { User } = require('../model');

const { SECRET_KEY } = process.env;

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        message: 'Not authorized',
      });
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer') {
      return res.status(401).json({
        message: 'Not authorized',
      });
    }

    jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({
        message: 'Not authorized',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = 'Not authorized';
    }
    next(error);
  }
};

module.exports = authentication;
