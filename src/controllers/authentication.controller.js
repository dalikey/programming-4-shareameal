const assert = require('assert');
const jwt = require('jsonwebtoken');
const { userValidation } = require('../validator/validation_schema');
const logger = require('../config/config').logger;
const jwtSecretKey = require('../config/config').jwtSecretKey;

let controller = {
  validateLogin(req, res, next) {
    let user = req.body;
    let { emailAdress, password } = user;
    try {
      assert(typeof emailAdress === 'string', 'Please enter an email address');
      assert(typeof password === 'string', 'Password is a required value');

      const { error } = userValidation(user);
      if (error) {
        const er = {
          status: 400,
          message: error.details[0].message,
        };
        next(er);
      }
      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  validateToken(req, res, next) {
    logger.info('validateToken called');
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('Authorization header missing!');
      const error = {
        status: 401,
        message: 'You have to be logged in to use this feature',
      };
      next(error);
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn('Not authorized');
          const error = {
            status: 401,
            message: 'Invalid token or not authorized',
          };
          next(error);
        }
        if (payload) {
          logger.debug('token is valid', payload);
          // User has acces. Add UserId from payload to
          // request, for each subsequent endpoint.
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};

module.exports = controller;
