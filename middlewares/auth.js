const jwt = require('jsonwebtoken');
const { UnathorizedError } = require('../errors/unathorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;
const { JWT_SECRET_KEY } = require('../utils/config');

module.exports = (req, res, next) => {
  const authorization = req.cookies.jwt;

  if (!authorization) {
    throw new UnathorizedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : JWT_SECRET_KEY);
  } catch (err) {
    throw new UnathorizedError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
