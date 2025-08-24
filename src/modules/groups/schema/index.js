const Joi = require("joi");

const schema = {
  add: {
    body: Joi.object({
      name: Joi.string().min(3).max(64).required(),
      description: Joi.string().min(3).max(64),
    }),
  },
  edit: {
    body: Joi.object({
      name: Joi.string().min(3).max(64).required(),
      description: Joi.string().min(3).max(64),
    }),
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
  remove: {
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
};

module.exports = schema;
