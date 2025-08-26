const common = require("../../../common");
const { db } = require("../../../db");
const { BadRequestError } = require("../../../shared/errors");

module.exports = async ({ params, body }) => {
  const { id } = params;

  const student = await db("students").where({ id }).first();
  if (!student) {
    throw new BadRequestError("Bunday talaba topilmadi!");
  }

  // Check unique fields if changed
  if (body.username) {
    const u = await db("students").where({ username: body.username }).whereNot({ id }).first();
    if (u) {
      throw new BadRequestError("Username oldin ro'yxatdan o'tgan!");
    }
  }
  if (body.phone_number) {
    await common.checkings.phone_number(body.phone_number);
    const p = await db("students").where({ phone_number: body.phone_number }).whereNot({ id }).first();
    if (p) {
      throw new BadRequestError("Telefon raqam oldin ro'yxatdan o'tgan!");
    }
  }
  if (body.group_id) {
    await common.checkings.found("groups", { id: body.group_id }, "Guruh");
  }

  const updateData = { ...body };
  if (body.password) {
    updateData.password = await common.helper.hashPassword(body.password);
  }

  const updated = await db("students").where({ id }).update(updateData).returning("*");
  return updated;
};
