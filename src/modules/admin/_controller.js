const express = require("express");
const common = require("../../common");
const services = require("./services");
const schema = require("./schema");

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const add = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.add,
    {
      body: req.body,
    },
    201,
    schema.add,
    { body: req.body }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

const login = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.login,
    { body: req.body },
    200,
    schema.login,
    { body: req.body }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

const list = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.list,
    {},
    200
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const edit = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.edit,
    { param: req.params, body: req.body },
    200,
    schema.edit,
    { params: req.params, body: req.body }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const remove = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.remove,
    { param: req.params, user: req.user },
    200,
    schema.remove,
    { params: req.params }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const profile = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.profile,
    { user: req.user },
    200
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const addAdminToGroup = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.addAdminToGroup,
    { body: req.body },
    200,
    schema.addAdminToGroup,
    { body: req.body }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const listGroupAdmins = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.listGroupAdmins,
    {},
    200
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const removeAdminGroups = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.removeAdminGroups,
    { params: req.params },
    200,
    schema.removeAdminGroups,
    { params: req.params }
  );
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const myGroup = async (req, res, next) => {
  return common.controller["middle-function"](
    { res, next },
    services.myGroup,
    { user: req.user },
    200
  );
};

const controller = {
  add,
  login,
  list,
  remove,
  edit,
  profile,
  addAdminToGroup,
  listGroupAdmins,
  removeAdminGroups,
  myGroup,
};

module.exports = controller;
