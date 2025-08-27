const { db } = require("../../../db");
const { ForbiddenError } = require("../../../shared/errors");

module.exports = async ({ user }) => {
  if (!user || user.role !== "student") {
    throw new ForbiddenError("Foydalanuvchi ruxsati yetarli emas!");
  }
  const me = await db("students").where({ id: user.id }).first();
  return me;
};
