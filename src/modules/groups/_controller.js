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
    { params: req.params, body: req.body },
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
    { params: req.params },
    200,
    schema.remove,
    { params: req.params }
  );
};

const controller = {
  add,
  list,
  remove,
  edit,
};

module.exports = controller;
