const Joi = require("joi");

const base = {
  first_name: Joi.string().min(2).max(64).required(),
  last_name: Joi.string().min(2).max(64).required(),
  phone_number: Joi.string().min(7).max(20).required(),
  username: Joi.string().min(3).max(64).required(),
  password: Joi.string().min(4).max(128).required(),
  group_id: Joi.number().integer().min(1).required(),
};

const schema = {
  login: {
    body: Joi.object({
      username: Joi.string().min(3).max(64).required(),
      password: Joi.string().min(4).max(128).required(),
    }),
  },
  add: {
    body: Joi.object(base),
  },
  edit: {
    body: Joi.object({
      first_name: Joi.string().min(2).max(64).required(),
      last_name: Joi.string().min(2).max(64).required(),
      phone_number: Joi.string().min(7).max(20).required(),
      username: Joi.string().min(3).max(64).required(),
      // password optional on edit; if provided we will hash it
      password: Joi.string().min(4).max(128),
      group_id: Joi.number().integer().min(1).required(),
    }),
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
  editSelf: {
    body: Joi.object({
      first_name: Joi.string().min(2).max(64),
      last_name: Joi.string().min(2).max(64),
      phone_number: Joi.string().min(7).max(20),
      username: Joi.string().min(3).max(64),
      password: Joi.string().min(4).max(128),
      group_id: Joi.number().integer().min(1),
    }),
  },
  remove: {
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
};

module.exports = schema;
