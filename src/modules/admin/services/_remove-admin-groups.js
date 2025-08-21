const { db } = require("../../../db");

module.exports = async ({ params }) => {
  const { id } = params; // group_admins jadvalidagi id

  if (!id) {
    throw new Error("id majburiy");
  }

  // 1. Bog‘lanish bormi?
  const exists = await db("group_admins").where({ id }).first();
  if (!exists) {
    throw new Error("Bunday bog‘lanish topilmadi");
  }

  // 2. O‘chirish

  return await db("group_admins").where({ id }).del().returning("*");
};
