const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Avval mavjud yozuvlarni o‘chirib tashlaymiz
  await knex("admin").del();

  // Parollarni hashlaymiz
  const superAdminPassword = await bcrypt.hash("123456", 10);

  // Yangi adminlar qo‘shamiz
  await knex("admin").insert([
    {
      first_name: "She'rozbek",
      last_name: "Baxtiyorov",
      phone_number: "+998938340617",
      role: "super_admin",
      username: "sherozbek",
      password: superAdminPassword,
    },
  ]);
};
