const { db } = require("../../../db");
const { BadRequestError } = require("../../../shared/errors");

module.exports = async ({ params, body }) => {
  let { id } = params;

  let group = await db("groups").where({ id }).first();

  if (!group) {
    throw new BadRequestError("Bunday guruh topilmadi!");
  }

  let updatedGroup = await db("groups")
    .where({ id })
    .update(body)
    .returning("*");

  return updatedGroup;
};
