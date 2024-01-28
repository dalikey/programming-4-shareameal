const Joi = require('joi');

const userValidation = (data) => {
  const schema = Joi.object({
    emailAdress: Joi.string()
      .email()
      .message('Email address is required, and must be valid')
      .required(),
    // Password minimum length example: 123
    password: Joi.string()
      .min(3)
      .message('Password is required, and must be at least 3 characters long')
      .required(),
    // Valid phone number examples: 0612345678 or +31612345678
    phoneNumber: Joi.string()
      .regex(
        /^(?:0|(?:\+|00) ?31 ?)(?:(?:[1-9] ?(?:[0-9] ?){8})|(?:6 ?-? ?[1-9] ?(?:[0-9] ?){7})|(?:[1,2,3,4,5,7,8,9]\d ?-? ?[1-9] ?(?:[0-9] ?){6})|(?:[1,2,3,4,5,7,8,9]\d{2} ?-? ?[1-9] ?(?:[0-9] ?){5}))$/
      )
      .message('PhoneNumber must be a Dutch number'),
  }).unknown();

  return schema.validate(data);
};

module.exports.userValidation = userValidation;
