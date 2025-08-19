const common = require("../../../common");
const { db } = require("../../../db");

module.exports = async ({ body }) => {
  const { username, password, phone_number } = body;

  await common.checkings.exist("admin", { username }, "Username");

  await common.checkings.phone_number(phone_number);
  
  await common.checkings.exist("admin", { phone_number }, "Telefon raqam");

  return db("admin")
    .insert({
      ...body,
      password: await common.helper.hashPassword(password),
    })
    .returning("*");
};
