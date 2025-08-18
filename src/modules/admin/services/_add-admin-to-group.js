const { db } = require("../../../db");
const { BadRequestError } = require("../../../shared/errors");

module.exports = async ({ body }) => {
  const { admin_id, group_id } = body;

  if (!admin_id || !group_id) {
    throw new BadRequestError("admin_id va group_id majburiy");
  }

  // 1. Admin bormi?
  const admin = await db("admin")
    .where({ id: admin_id, is_deleted: false })
    .first();
  if (!admin) {
    throw new BadRequestError("Admin topilmadi yoki o‘chirilgan");
  }

  // 2. Guruh bormi?
  const group = await db("groups").where({ id: group_id }).first();
  if (!group) {
    throw new BadRequestError("Guruh topilmadi");
  }

  // 3. Oldin qo‘shilganmi?
  const exists = await db("group_admins").where({ admin_id, group_id }).first();
  if (exists) {
    throw new BadRequestError("Bu admin allaqachon ushbu guruhga tayinlangan");
  }

  return await db("group_admins")
    .insert({
      admin_id,
      group_id,
    })
    .returning("*");
};
