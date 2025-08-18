const Joi = require("joi");

const schema = {
  add: {
    body: Joi.object({
      first_name: Joi.string().min(3).max(64).required(),
      last_name: Joi.string().min(3).max(64).required(),
      username: Joi.string().min(4).max(64).required(),
      phone_number: Joi.string().min(5).max(64).required(),
      password: Joi.string().min(4).max(64).required(),
      role: Joi.string().valid("admin", "super_admin").required(),
    }),
  },
  login: {
    body: Joi.object({
      username: Joi.string().min(4).max(64).required(),
      password: Joi.string().min(4).max(64).required(),
    }),
  },
  remove: {
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
  edit: {
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
    body: Joi.object({
      first_name: Joi.string().min(3).max(64).required(),
      last_name: Joi.string().min(3).max(64).required(),
      username: Joi.string().min(4).max(64).required(),
      phone_number: Joi.string().min(5).max(64).required(),
      role: Joi.string().valid("admin", "super_admin").required(),
    }),
  },
  addAdminToGroup: {
    body: Joi.object({
      group_id: Joi.string().min(1).max(64).required(),
      admin_id: Joi.string().min(1).max(64).required(),
    }),
  },
  removeAdminGroups: {
    params: Joi.object({
      id: Joi.string().min(1).max(64).required(),
    }),
  },
};

module.exports = schema;
