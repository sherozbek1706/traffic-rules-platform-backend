const { db } = require("../../../db");
module.exports = async ({ body }) => {
  const newgroup = await db("groups").insert(body).returning("*");

  return newgroup;
};
