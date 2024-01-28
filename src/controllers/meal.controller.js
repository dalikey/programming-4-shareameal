const assert = require('assert');
const dbconnection = require('../database/dbconnection');
const logger = require('../config/config').logger;
let currentAmountOfParticipants = 0;

let controller = {
  validateMeal: (req, res, next) => {
    let meal = req.body;
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      imageUrl,
      allergenes,
      maxAmountOfParticipants,
      price,
    } = meal;
  
    const validationRules = [
      [name, 'string', 'Name is a required value'],
      [description, 'string', 'Description is a required field'],
      [isActive, 'boolean', 'isActive must be a true or false'],
      [isVega, 'boolean', 'isVega must be a true or false'],
      [isVegan, 'boolean', 'isVegan must be a true or false'],
      [isToTakeHome, 'boolean', 'isToTakeHome must be a true or false'],
      [dateTime, 'string', 'dateTime is a required value'],
      [imageUrl, 'string', 'imageUrl is a required value'],
      [allergenes, 'object', 'allergenes must be an array and is required'],
      [maxAmountOfParticipants, 'number', 'maxAmountOfParticipants is a required value and must be a number'],
      [price, 'number', 'Price is a required value and must be a number'],
    ];
  
    validateFields(validationRules, next);
    next();
  },

  validateMealUpdate: (req, res, next) => {
    let meal = req.body;
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      imageUrl,
      allergenes,
      maxAmountOfParticipants,
      price,
    } = meal;
  
    const validationRules = [
      [name, 'string', 'Name is a required value'],
      [description, 'string', 'Description is a required field'],
      [isActive, 'boolean', 'isActive must be a true or false'],
      [isVega, 'boolean', 'isVega must be a true or false'],
      [isVegan, 'boolean', 'isVegan must be a true or false'],
      [isToTakeHome, 'boolean', 'isToTakeHome must be a true or false'],
      [dateTime, 'string', 'dateTime is a required value'],
      [imageUrl, 'string', 'imageUrl is a required value'],
      [allergenes, 'object', 'allergenes must be an array and is required'],
      [maxAmountOfParticipants, 'number', 'maxAmountOfParticipants is a required value and must be a number'],
      [price, 'number', 'Price is a required value and must be a number'],
    ];
  
    validateFields(validationRules, next);
    next();
  },

  addMeal: (req, res, next) => {
    let meal = req.body;
    let { allergenes } = meal; // I decided to use 'meal.etc' because of the Prettier formatter
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
          `INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), ?, ?, ?, '${allergenes}', '${req.userId}');`,
          [
            meal.name,
            meal.description,
            meal.isActive,
            meal.isVega,
            meal.isVegan,
            meal.isToTakeHome,
            meal.dateTime,
            meal.maxAmountOfParticipants,
            meal.price,
            meal.imageUrl,
          ],
          (error, result, fields) => {
            connection.release();

            if (!error) {
              meal = {
                id: result.insertId,
                ...meal,
              };
              res.status(201).json({
                status: 201,
                message: 'added new meal with values:',
                result: meal,
              });
            } else {
              const error = {
                status: 409,
                message: `Name ${meal.name} is not valid or already exists`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  getAllMeals: (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        const er = {
          status: 401,
          error: err.message,
          message: `Please make sure MySQL and Apache are on in XAMPP`,
        };
        next(er);
      } else {
        let allMealQuery = 'SELECT * FROM meal ';
        let { isActive, name } = req.query;
        logger.debug(`searchTerm = ${name}, isActive = ${isActive}`);

        if (isActive || name) {
          allMealQuery += 'WHERE ';
          if (name) {
            allMealQuery += `name LIKE '%${name}%'`;
          }
          if (isActive && name) allMealQuery += ' AND ';
          switch (isActive) {
            case undefined:
              break;
            case 'true':
            case 'false':
              allMealQuery += ` isActive = ${isActive}`;
              break;
            default:
              allMealQuery = `SELECT * FROM meal WHERE name = 'INoExist69420BlazeMangoDaloene'`;
              break;
          }
        }
        allMealQuery += ';';
        connection.query(allMealQuery, (error, allMealResults, fields) => {
          connection.release();
          if (error) {
            const er = {
              status: 401,
              message: error.message,
            };
            next(er);
          } else if (allMealResults.length > 0) {
            logger.debug('#results = ' + allMealResults.length);

            let getCookFromIdsQuery = `SELECT * FROM user `;
            let cookIdStorage = [];
            for (i = 0; i < allMealResults.length; i++) {
              let savePoint = allMealResults[i].cookId;
              cookIdStorage.push(savePoint);
            }
            logger.debug('cookIdStorage = ' + cookIdStorage);
            if (cookIdStorage.length > 0) getCookFromIdsQuery += 'WHERE ';
            for (let i = 0; i < cookIdStorage.length; i++) {
              getCookFromIdsQuery += `id = ${cookIdStorage[i]}`;
              if (cookIdStorage.length > 0 && i != cookIdStorage.length - 1) {
                getCookFromIdsQuery += ` OR `;
              }
            }
            getCookFromIdsQuery += `;`;

            connection.query(
              getCookFromIdsQuery,
              (error, cookResult, fields) => {
                connection.release();
                if (error) {
                  const error = {
                    status: 401,
                    message: `User with ID ${cookResult[0].cookId} is invalid`,
                  };
                  next(error);
                } else if (cookResult.length > 0) {
                  cookResult.forEach((item, index) => {
                    cookResult[index].isActive = booleanConverter(
                      cookResult[index].isActive
                    );
                    cookResult[index].roles = ['editor', 'guest'];
                  });

                  connection.query(
                    `SELECT mealId, userId FROM meal_participants_user;`,
                    (error, participateIdResult, fields) => {
                      connection.release();
                      if (error) {
                        const error = {
                          status: 401,
                          message: `User with ID ${mealId.cookId} is invalid`,
                        };
                        next(error);
                      } else {
                        connection.query(
                          `SELECT * FROM user;`,
                          (error, prtpResult, fields) => {
                            connection.release();
                            if (error) {
                              const error = {
                                status: 401,
                                message: `Unable to fetch userIds`,
                              };
                              next(error);
                            }

                            if (prtpResult) {
                              prtpResult.forEach((item, index) => {
                                if (prtpResult[index].roles.length > 0) {
                                  let chunk =
                                    prtpResult[index].roles.split(',');
                                  prtpResult[index].roles = chunk;
                                } else {
                                  prtpResult[index].roles = [];
                                }
                                switch (prtpResult[index].isActive) {
                                  case 1:
                                    prtpResult[index].isActive = true;
                                    break;
                                  default:
                                    prtpResult[index].isActive = false;
                                }
                              });

                              let users = [];
                              let checkUpValue = 2;
                              let idStorage = [];
                              let mealIdIdentifier = 1;
                              allMealResults.forEach((item, index) => {
                                meals = allMealResults[index];
                                meals.cook =
                                  cookResult[cookIdStorage[index] - 1];
                                meals.isActive = booleanConverter(
                                  meals.isActive
                                );
                                meals.isVega = booleanConverter(meals.isVega);
                                meals.isVegan = booleanConverter(meals.isVegan);
                                meals.isToTakeHome = booleanConverter(
                                  meals.isToTakeHome
                                );
                                if (meals.allergenes.length > 0) {
                                  let chunk = meals.allergenes.split(',');
                                  meals.allergenes = chunk;
                                } else {
                                  meals.allergenes = [];
                                }

                                for (
                                  i = 0;
                                  i < participateIdResult.length;
                                  i++
                                ) {
                                  if (
                                    participateIdResult[i].mealId ==
                                    mealIdIdentifier
                                  ) {
                                    let savePoint =
                                      participateIdResult[i].userId;
                                    idStorage.push(savePoint);
                                  }
                                }
                                mealIdIdentifier++;
                                logger.debug(
                                  'Particp idStorage = ' + idStorage
                                );

                                idStorage.forEach((item, index) => {
                                  users.push(prtpResult[idStorage[index] - 1]);
                                });
                                meals.participants = users;
                                users = [];
                                idStorage = [];
                              });
                              logger.debug(participateIdResult);
                              res.status(200).json({
                                status: 200,
                                result: allMealResults,
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  const error = {
                    status: 404,
                    message: `User with ID ${allMealResults.cookId} does not exist`,
                  };
                  next(error);
                }
              }
            );
          } else {
            res.status(200).json({
              status: 200,
              result: allMealResults,
            });
          }
        });
      }
    });
  },

  getMealById: (req, res, next) => {
    const mealId = req.params.id;
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
          `SELECT * FROM meal WHERE id = ?;`,
          [mealId],
          (error, mealResult, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `Meal with ID ${mealId} is invalid`,
              };
              next(error);
            } else if (mealResult.length > 0) {
              meal = mealResult[0];
              meal.isActive = booleanConverter(meal.isActive);
              meal.isVega = booleanConverter(meal.isVega);
              meal.isVegan = booleanConverter(meal.isVegan);
              meal.isToTakeHome = booleanConverter(meal.isToTakeHome);
              if (meal.allergenes.length > 0) {
                let chunk = meal.allergenes.split(',');
                meal.allergenes = chunk;
              } else {
                meal.allergenes = [];
              }
              connection.query(
                `SELECT * FROM user WHERE id = ?;`,
                [meal.cookId],
                (error, cookResult, fields) => {
                  connection.release();
                  if (error) {
                    const error = {
                      status: 401,
                      message: `User with ID ${meal.cookId} is invalid`,
                    };
                    next(error);
                  } else if (cookResult.length > 0) {
                    cookResult[0].isActive = booleanConverter(
                      cookResult[0].isActive
                    );
                    cookResult[0].roles = ['editor', 'guest'];
                    meal.cook = cookResult[0];
                    connection.query(
                      `SELECT userId FROM meal_participants_user WHERE mealId = ?;`,
                      [mealId],
                      (error, participateIdResult, fields) => {
                        logger.debug(
                          'participateIdResult = ' + participateIdResult
                        );
                        connection.release();
                        if (error) {
                          const error = {
                            status: 401,
                            message: `User with ID ${meal.cookId} is invalid`,
                          };
                          next(error);
                        } else {
                          let getUserFromIdsQuery = `SELECT * FROM user `;

                          if (participateIdResult.length > 0) {
                            let i;
                            getUserFromIdsQuery += 'WHERE ';
                            for (i = 0; i < participateIdResult.length; i++) {
                              let savePoint = participateIdResult[i].userId;
                              getUserFromIdsQuery += `id = ${savePoint}`;
                              if (
                                participateIdResult.length > 0 &&
                                i != participateIdResult.length - 1
                              ) {
                                getUserFromIdsQuery += ` OR `;
                              }
                            }
                          } else {
                            getUserFromIdsQuery = `SELECT * FROM user WHERE firstName = 'dnwaiowfjwoaijgwoeho'`;
                          }
                          getUserFromIdsQuery += `;`;

                          connection.query(
                            getUserFromIdsQuery,
                            (error, prtpResult, fields) => {
                              connection.release();

                              if (error) {
                                const error = {
                                  status: 401,
                                  message: `Unable to fetch userIds`,
                                };
                                next(error);
                              }

                              if (prtpResult) {
                                prtpResult.forEach((item, index) => {
                                  if (prtpResult[index].roles.length > 0) {
                                    let chunk =
                                      prtpResult[index].roles.split(',');
                                    prtpResult[index].roles = chunk;
                                  } else {
                                    prtpResult[index].roles = [];
                                  }
                                  switch (prtpResult[index].isActive) {
                                    case 1:
                                      prtpResult[index].isActive = true;
                                      break;
                                    default:
                                      prtpResult[index].isActive = false;
                                  }
                                });

                                meal.participants = prtpResult;
                                res.status(200).json({
                                  status: 200,
                                  result: meal,
                                });
                              }
                            }
                          );
                        }
                      }
                    );
                  } else {
                    const error = {
                      status: 404,
                      message: `User with ID ${meal.cookId} does not exist`,
                    };
                    next(error);
                  }
                }
              );
            } else {
              const error = {
                status: 404,
                message: `Meal with ID ${mealId} does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  updateMealById: (req, res, next) => {
    let meal = req.body;
    const mealId = req.params.id;
    let { allergenes } = meal;
    let query = `UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, name = ?, description = ?, dateTime = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), maxAmountOfParticipants = ?, price = ?, imageUrl = ?, allergenes = '${allergenes}' WHERE id = ?;`;
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
          `SELECT * FROM meal WHERE id = ?;`,
          [mealId],
          (error, result, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `Meal with ID ${mealId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              if (req.userId == result[0].cookId) {
                connection.query(
                  query,
                  [
                    meal.isActive,
                    meal.isVega,
                    meal.isVegan,
                    meal.isToTakeHome,
                    meal.name,
                    meal.description,
                    meal.dateTime,
                    meal.maxAmountOfParticipants,
                    meal.price,
                    meal.imageUrl,
                    parseInt(mealId),
                  ],
                  (error, result, fields) => {
                    connection.release();
                    if (error) {
                      const error = {
                        status: 401,
                        message: `Meal with ID ${mealId} is invalid`,
                      };
                      next(error);
                    } else if (result.affectedRows > 0) {
                      meal = {
                        id: mealId,
                        ...meal,
                      };
                      res.status(200).json({
                        status: 200,
                        message: 'Updated meal with values:',
                        result: meal,
                      });
                    }
                  }
                );
              } else {
                const error = {
                  status: 403,
                  message: `You are not the owner of this meal, therefore you do not have permission to delete it`,
                };
                next(error);
              }
            } else {
              const error = {
                status: 404,
                message: `Meal does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  deleteMealById: (req, res, next) => {
    const mealId = req.params.id;
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
          `SELECT * FROM meal WHERE id = ?;`,
          [mealId],
          (error, result, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `Meal with ID ${mealId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              if (req.userId == result[0].cookId) {
                connection.query(
                  `DELETE FROM meal WHERE id = ?;`,
                  [mealId],
                  (error, result, fields) => {
                    connection.release();
                    if (error) {
                      const error = {
                        status: 401,
                        message: `Meal with ID ${mealId} is invalid`,
                      };
                      next(error);
                    } else if (result.affectedRows > 0) {
                      res.status(200).json({
                        status: 200,
                        message: `Deleted meal with Id: ${mealId}`,
                      });
                    }
                  }
                );
              } else {
                const error = {
                  status: 403,
                  message: `You are not the owner of this meal, therefore you do not have permission to delete it`,
                };
                next(error);
              }
            } else {
              const error = {
                status: 404,
                message: `Meal does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },

  participateInAMeal: (req, res, next) => {
    let mealId = parseInt(req.params.id);
    let userId = req.userId;
    let participateTable = {
      mealId,
      userId,
    };
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
          `SELECT * FROM meal WHERE id = ?;`,
          [mealId],
          (error, result, fields) => {
            connection.release();
            if (error) {
              const error = {
                status: 401,
                message: `Meal with ID ${mealId} is invalid`,
              };
              next(error);
            } else if (result.length > 0) {
              connection.query(
                `SELECT COUNT(*) AS count FROM meal_participants_user WHERE mealId = ? AND userId = ?;`,
                [mealId, userId],
                (error, result, fields) => {
                  logger.debug('Result count = ' + result[0].count);
                  connection.release();
                  if (error) {
                    const er = {
                      status: 401,
                      error: error.message,
                    };
                    next(er);
                  } else if (result[0].count == 0) {
                    connection.query(
                      `INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?);`,
                      [mealId, userId],
                      (error, result, fields) => {
                        connection.release();
                        if (error) {
                          const er = {
                            status: 401,
                            error: error.message,
                          };
                          next(er);
                        } else if (result.affectedRows > 0) {
                          currentAmountOfParticipants++;
                          res.status(200).json({
                            status: 200,
                            message: `Successfully participated`,
                            result: participateTable,
                            currentlyParticipating: true,
                            currentAmountOfParticipants:
                              currentAmountOfParticipants,
                          });
                        } else {
                          const error = {
                            status: 404,
                            message: `Meal does not exist (Still in test phase)`,
                          };
                          next(error);
                        }
                      }
                    );
                  } else if (result[0].count > 0) {
                    connection.query(
                      `DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?;`,
                      [mealId, userId],
                      (error, result, fields) => {
                        connection.release();
                        if (error) {
                          const er = {
                            status: 401,
                            error: error.message,
                          };
                          next(er);
                        } else if (result.affectedRows > 0) {
                          if (currentAmountOfParticipants > 0) {
                            currentAmountOfParticipants--;
                          }
                          res.status(200).json({
                            status: 200,
                            message: `Successfully signed out of meal participation`,
                            result: participateTable,
                            currentlyParticipating: false,
                            currentAmountOfParticipants:
                              currentAmountOfParticipants,
                          });
                        }
                      }
                    );
                  }
                }
              );
            } else {
              const error = {
                status: 404,
                message: `Meal does not exist`,
              };
              next(error);
            }
          }
        );
      }
    });
  },
};

const validateFields = (fields, next) => {
  fields.forEach(([value, type, message]) => {
    try {
      assert(typeof value === type, message);
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  });
};

const booleanConverter = (value) => {
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
