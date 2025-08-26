const common = require("../../../common");
const { db } = require("../../../db");

module.exports = async ({ body }) => {
  const { username, phone_number, password, group_id } = body;

  await common.checkings.exist("students", { username }, "Username");
  await common.checkings.phone_number(phone_number);
  await common.checkings.exist("students", { phone_number }, "Telefon raqam");

  // Ensure group exists
  await common.checkings.found("groups", { id: group_id }, "Guruh");

  const inserted = await db("students")
    .insert({
      ...body,
      password: await common.helper.hashPassword(password),
    })
    .returning("*");

  return inserted;
};
