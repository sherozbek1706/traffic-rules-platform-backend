// const { db } = require("../../../db");
// const { BadRequestError } = require("../../../shared/errors");

// module.exports = async ({ params }) => {
//   let { id } = params;
//   let group = await db("groups").where({ id }).first();

//   if (!group) {
//     throw new BadRequestError("Bunday guruh topilmadi!");
//   }

//   let removedGroup = await db("groups").where({ id }).del().returning("*");

//   return removedGroup;
// };

// src/modules/groups/delete-group.js
const { db } = require("../../../db");
const { BadRequestError } = require("../../../shared/errors");

module.exports = async ({ params }) => {
  const { id } = params;

  const group = await db("groups").where({ id }).first();
  if (!group) {
    throw new BadRequestError("Bunday guruh topilmadi!");
  }

  // Shu guruhga ulangan talabalar bormi?
  const { count } = await db("students")
    .where({ group_id: id })
    .count("* as count")
    .first();
  const hasStudents = Number(count) > 0;

  if (hasStudents) {
    // Talabalar bor — o‘chirishni bloklaymiz
    throw new BadRequestError(
      "Guruhni o‘chirish mumkin emas: unga biriktirilgan talabalar mavjud. " +
        "Avval ularni boshqa guruhga o‘tkazing yoki guruhdan chiqarib yuboring."
    );
  }

  const removed = await db("groups").where({ id }).del().returning("*");
  return removed; // [row]
};
