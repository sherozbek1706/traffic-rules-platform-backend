const common = require("../../../common");
const { db } = require("../../../db");

module.exports = async ({ param, body }) => {
  const { id } = param;
  const { first_name, last_name, username, phone_number, role } = body;

  // Admin mavjudligini tekshirish
  const currentAdmin = await common.checkings.found(
    "admin",
    { id, is_deleted: false },
    "Admin"
  );

  // Agar username o'zgargan bo'lsa, mavjudligini tekshirish
  if (currentAdmin.username !== username) {
    await common.checkings.exist("admin", { username }, "Username");
  }

  // Telefon raqam formati to'g'riligini tekshirish
  await common.checkings.phone_number(phone_number);

  // Agar telefon raqami o'zgargan bo'lsa, mavjudligini tekshirish
  if (currentAdmin.phone_number !== phone_number) {
    await common.checkings.exist("admin", { phone_number }, "Telefon raqam");
  }

  return await db("admin")
    .where({ id })
    .update({ username, role, phone_number, first_name, last_name })
    .returning("*");
};
