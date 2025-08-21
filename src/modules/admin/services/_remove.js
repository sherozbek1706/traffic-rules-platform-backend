const common = require("../../../common");
const { db } = require("../../../db");
const { ForbiddenError } = require("../../../shared/errors");

module.exports = async ({ param, user }) => {
  const { id } = param;

  if (+id === +user.id) {
    throw new ForbiddenError("Admin o'zini o'zi o'chira olmaydi");
  }

  await common.checkings.found("admin", { id }, "Admin");

  return await db("admin").where({ id }).del().returning("*");
};
