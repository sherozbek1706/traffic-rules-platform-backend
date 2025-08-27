const { db } = require("../../../db");
const { BadRequestError } = require("../../../shared/errors");

module.exports = async ({ params }) => {
  const { id } = params;

  const existing = await db("students").where({ id }).first();
  if (!existing) {
    throw new BadRequestError("Bunday talaba topilmadi!");
  }

  const removed = await db("students").where({ id }).del().returning("*");
  return removed;
};
