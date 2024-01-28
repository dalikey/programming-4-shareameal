const assert = require('assert');
const dbconnection = require('../database/dbconnection');
const { userValidation } = require('../validator/validation_schema');
const logger = require('../config/config').logger;
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../config/config').jwtSecretKey;
const bcrypt = require('bcrypt');

let controller = {
  login: async (req, res, next) => {
    try {
      const { emailAdress, password } = req.body;
      if (!emailAdress || !password) {
        const error = {
          status: 400,
          error: `Missing ${!emailAdress ? 'emailAdress' : 'password'}!`,
        };
        next(error);
      }
      dbconnection.getConnection((err, connection) => {
        if (err) {
          logger.error('Error getting connection from dbconnection');
          const error = {
            status: 500,
            message: err.message,
          };
          next(error);
        } else {
          if (connection) {
            // 1. See if this user account exists.
            connection.query(
              'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName`, `street`, `city`, `isActive`, `phoneNumber` FROM `user` WHERE `emailAdress` = ?',
              [req.body.emailAdress],
              async (err, rows, fields) => {
                connection.release();

                if (err) {
                  logger.error('message: ', err.message);
                  const error = {
                    status: 500,
                    message: err.message,
                  };
                  next(error);
                }
                let validPass;
                if (rows) {
                  if (rows[0]) {
                    // 2. There was a result, check the password.
                    logger.debug(req.body.password);
                    logger.debug(rows[0].password);
                    validPass = await bcrypt.compare(
                      password,
                      rows[0].password
                    );
                    logger.debug('Is valid ' + validPass);
                  }

                  if (rows && rows.length === 1 && validPass) {
                    logger.info(
                      'passwords DID match, sending userinfo and valid token'
                    );
                    // Extract the password from the userdata - we do not send that in the response.
                    switch (rows[0].isActive) {
                      case 1:
                        rows[0].isActive = true;
                        break;
                      default:
                        rows[0].isActive = false;
                    }
                    const { password, ...userinfo } = rows[0];

                    // Create an object containing the data we want in the payload.
                    const payload = {
                      userId: userinfo.id,
                    };

                    jwt.sign(
                      payload,
                      jwtSecretKey,
                      { expiresIn: '12d' },
                      function (err, token) {
                        logger.debug('User logged in, sending: ', userinfo);
                        res.status(200).json({
                          status: 200,
                          result: { ...userinfo, token },
                        });
                      }
                    );
                  } else {
                    logger.info('User not found or password invalid');
                    const error = {
                      status: 404,
                      message: 'User not found or password invalid',
                    };
                    next(error);
                  }
                }
              }
            );
          }
        }
      });
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      password,
      phoneNumber,
    } = user;
    try {
      assert(typeof firstName === 'string', 'Please enter a valid first name');
      assert(typeof lastName === 'string', 'Please enter a valid last name');
      assert(typeof street === 'string', 'Street is a required value');
      assert(typeof city === 'string', 'City is a required value');
      assert(typeof isActive === 'boolean', 'IsActive must be a true or false');
      assert(typeof emailAdress === 'string', 'Please enter an email address');
      assert(typeof password === 'string', 'Password is a required value');
      assert(typeof phoneNumber === 'string', 'Phone number must be entered');
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

  validateUserUpdate: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, street, city, emailAdress, password } = user;
    try {
      assert(typeof firstName === 'string', 'Please enter a valid first name');
      assert(typeof lastName === 'string', 'Please enter a valid last name');
      assert(typeof street === 'string', 'Street is a required value');
      assert(typeof city === 'string', 'City is a required value');
      assert(
        typeof emailAdress === 'string',
        'Please enter a valid email address'
      );
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

  addUser: async (req, res, next) => {
    try {
      let user = req.body;
      const { emailAdress, password } = req.body;
      if (!emailAdress || !password) {
        const error = {
          status: 400,
          error: `Missing ${!emailAdress ? 'emailAdress' : 'password'}!`,
        };
        next(error);
      }
      const hash = await bcrypt.hash(password, 10);
      dbconnection.getConnection((err, connection) => {
        if (err) {
          const er = {
            status: 401,
            error: err.message,
            message: `Please make sure MySQL and Apache are on in XAMPP`,
          };
          next(er);
        } else {
          connection.query(
            `INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              user.firstName,
              user.lastName,
              user.street,
              user.city,
              user.isActive,
              user.emailAdress,
              hash,
              user.phoneNumber,
            ],
            (error, result, fields) => {
              connection.release();
              if (!error) {
                user = {
                  id: result.insertId,
                  ...user,
                };
                res.status(201).json({
                  status: 201,
                  message: 'added new user with values:',
                  result: user,
                  ps: `the password will be encrypted in the database '${hash}'`,
                });
              } else {
                const error = {
                  status: 409,
                  message: `EmailAdress ${user.emailAdress} is not valid or already exists`,
                };
                next(error);
              }
            }
          );
        }
      });
    } catch (err) {
      if (err.errno === 19) {
        const error = {
          status: 400,
          message: `A user with that email already exists!`,
        };
        next(error);
      } else {
        const error = {
          status: 400,
          message: err.message,
        };
        next(error);
      }
    }
  },

  getAllUsers: (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        const er = {
          status: 401,
          error: err.message,
          message: `Please make sure MySQL and Apache are on in XAMPP`,
        };
        next(er);
      } else {
        let query = 'SELECT * FROM user ';

        let { isActive, firstName } = req.query;
        logger.debug(`isActive = ${isActive}, firstName = ${firstName}`);

        if (isActive || firstName) {
          query += 'WHERE ';
          if (firstName) {
            query += `firstName LIKE '%${firstName}%'`;
          }
          if (isActive && firstName) query += ' AND ';
          switch (isActive) {
            case undefined:
              break;
            case 'true':
            case 'false':
              query += ` isActive = ${isActive}`;
              break;
            default:
              logger.warn('Invalid isActive query');
              query += ` firstName = dowiahfwoahoifhoqi`;
              break;
          }
        }
        query += ';';

        connection.query(query, (error, results, fields) => {
          connection.release();
          if (error) {
            const er = {
              status: 401,
              error: error.message,
            };
            next(er);
          }
          logger.debug('#results = ' + results.length);
          results.forEach((item, index) => {
            if (results[index].roles.length > 0) {
              let chunk = results[index].roles.split(',');
              results[index].roles = chunk;
            } else {
              results[index].roles = [];
            }
            switch (results[index].isActive) {
              case 1:
                results[index].isActive = true;
                break;
              default:
                results[index].isActive = false;
            }
          });
          res.status(200).json({
            status: 200,
            result: results,
          });
        });
      }
    });
  },

  getProfileFromUser: (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        const er = {
          status: 401,
          error: err.message,
          message: `Please make sure MySQL and Apache are on in XAMPP`,
        };
        next(er);
      } else {
        connection.query(
          `SELECT * FROM user WHERE id = ?;`,
          [req.userId],
          (error, result, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `User with ID ${req.userId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              if (result[0].roles.length > 0) {
                let chunk = result[0].roles.split(',');
                result[0].roles = chunk;
              } else {
                result[0].roles = [];
              }
              result[0].isActive = trueConverter(result[0].isActive);
              res.status(200).json({
                status: 200,
                result: result[0],
              });
            } else {
              const error = {
                status: 404,
                message: `User with ID ${req.userId} does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  getUserById: (req, res, next) => {
    const userId = req.params.id;
    dbconnection.getConnection((err, connection) => {
      if (err) {
        const er = {
          status: 401,
          error: err.message,
          message: `Please make sure MySQL and Apache are on in XAMPP`,
        };
        next(er);
      } else {
        connection.query(
          `SELECT * FROM user WHERE id = ?;`,
          [userId],
          (error, result, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `User with ID ${userId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              if (result[0].roles.length > 0) {
                let chunk = result[0].roles.split(',');
                result[0].roles = chunk;
              } else {
                result[0].roles = [];
              }
              result[0].isActive = trueConverter(result[0].isActive);
              res.status(200).json({
                status: 200,
                result: result[0],
              });
            } else {
              const error = {
                status: 404,
                message: `User with ID ${userId} does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  updateUserById: async (req, res, next) => {
    try {
      let user = req.body;
      const { emailAdress, password } = req.body;
      const userId = req.params.id;

      if (!emailAdress || !password) {
        const error = {
          status: 400,
          error: `Missing ${!emailAdress ? 'emailAdress' : 'password'}!`,
        };
        next(error);
      }
      const hash = await bcrypt.hash(password, 10);
      dbconnection.getConnection((err, connection) => {
        if (err) {
          const er = {
            status: 401,
            error: err.message,
            message: `Please make sure MySQL and Apache are on in XAMPP`,
          };
          next(er);
        } else {
          dbconnection.getConnection((err, connection) => {
            if (err) {
              const er = {
                status: 401,
                error: err.message,
              };
              next(er);
            }
            connection.query(
              `UPDATE user SET firstName = ?, lastName = ?, street = ?, city = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ? WHERE id = ?;`,
              [
                user.firstName,
                user.lastName,
                user.street,
                user.city,
                user.isActive,
                user.emailAdress,
                hash,
                user.phoneNumber,
                userId,
              ],
              (error, result, fields) => {
                connection.release();

                if (error) {
                  const error = {
                    status: 401,
                    message: `User with emailAdress ${user.emailAdress} does not match email of the ID`,
                  };
                  next(error);
                } else if (result.affectedRows > 0) {
                  user = {
                    id: parseInt(userId),
                    ...user,
                  };
                  res.status(200).json({
                    status: 200,
                    message: 'Updated user with values:',
                    result: user,
                    ps: `the password will be encrypted in the database '${hash}'`,
                  });
                } else {
                  const error = {
                    status: 400,
                    message: `User does not exist`,
                  };
                  next(error);
                }
              }
            );
          });
        }
      });
    } catch (err) {
      if (err.errno === 19) {
        const error = {
          status: 400,
          message: `A user with that email already exists!`,
        };
        next(error);
      } else {
        const error = {
          status: 400,
          message: err.message,
        };
        next(error);
      }
    }
  },

  deleteUserById: (req, res, next) => {
    const userId = req.params.id;
    dbconnection.getConnection((err, connection) => {
      if (err) {
        const er = {
          status: 401,
          error: err.message,
          message: `Please make sure MySQL and Apache are on in XAMPP`,
        };
        next(er);
      } else {
        connection.query(
          `SELECT * FROM user WHERE id = ${userId};`,
          (error, result, fields) => {
            connection.release();

            if (error) {
              const error = {
                status: 401,
                message: `User with ID ${userId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              if (req.userId == userId) {
                connection.query(
                  `DELETE FROM user WHERE id = ${userId};`,
                  (error, result, fields) => {
                    connection.release();

                    if (error) {
                      const error = {
                        status: 401,
                        message: `User with ID ${userId} is invalid`,
                      };
                      next(error);
                    } else if (result.affectedRows > 0) {
                      res.status(200).json({
                        status: 200,
                        message: `Deleted user with Id: ${userId}`,
                      });
                    }
                  }
                );
              } else {
                const error = {
                  status: 403,
                  message: `You are not the owner of this user with Id: ${userId}, therefore you do not have permission to delete it`,
                };
                next(error);
              }
            } else {
              const error = {
                status: 400,
                message: `User does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },
};

let trueConverter = (value) => {
  switch (value) {
    case 1:
      value = true;
      break;
    default:
      value = false;
  }
  return value;
};

module.exports = controller;
