// const { db } = require("../../../db");

// module.exports = async () => {
//   // Simple list of students; could be extended with JOIN to groups
//   const list = await db("students").select("*");
//   return list;
// };

// modules/students/list.js
const { db } = require("../../../db");

module.exports = async () => {
  const list = await db("students as s")
    .leftJoin("groups as g", "s.group_id", "g.id")
    .select("s.*", "g.name as group_name")
    .orderBy("s.id", "asc");
  return list;
};
