const common = require("../../../common");
const { db } = require("../../../db");
const { ForbiddenError, BadRequestError } = require("../../../shared/errors");

module.exports = async ({ user, body }) => {
  if (!user || user.role !== "student") {
    throw new ForbiddenError("Ruxsat etilmagan!");
  }

  const current = await db("students").where({ id: user.id }).first();
  if (!current) {
    throw new BadRequestError("Bunday talaba topilmadi!");
  }

  // Uniqueness checks if updating sensitive fields
  if (body.username) {
    const u = await db("students")
      .where({ username: body.username })
      .whereNot({ id: user.id })
      .first();
    if (u) throw new BadRequestError("Username oldin ro'yxatdan o'tgan!");
  }

  if (body.phone_number) {
    await common.checkings.phone_number(body.phone_number);
    const p = await db("students")
      .where({ phone_number: body.phone_number })
      .whereNot({ id: user.id })
      .first();
    if (p) throw new BadRequestError("Telefon raqam oldin ro'yxatdan o'tgan!");
  }

  if (body.group_id) {
    await common.checkings.found("groups", { id: body.group_id }, "Guruh");
  }

  const update = { ...body };
  if (body.password) {
    update.password = await common.helper.hashPassword(body.password);
  }

  const updated = await db("students")
    .where({ id: user.id })
    .update(update)
    .returning("*");

  return updated;
};
