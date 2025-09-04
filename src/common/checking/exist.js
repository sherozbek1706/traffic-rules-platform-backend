const { db } = require("../../db");
const { BadRequestError } = require("../../shared/errors");
module.exports = async (db_table_name, findEl, message) => {
  const exist = await db(db_table_name).where(findEl).first();

  if (exist) {
    throw new BadRequestError(`${message} oldin ro'yxatdan o'tgan!`);
  }
};

// Bu common oldin bazaga kiritilganmi yoki yo'qmi shuni tekshirish uchun kerak. Agar topilsa xatolik beradi.
