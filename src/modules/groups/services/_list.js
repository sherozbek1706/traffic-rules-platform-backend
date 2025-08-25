const { db } = require("../../../db");

module.exports = async () => {
  const list = await db("groups").select("*");

  return list;
};
