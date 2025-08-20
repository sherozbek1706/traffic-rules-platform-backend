const { db } = require("../../../db");

module.exports = async ({ user }) => {
  const { id } = user;

  const profile = await db("admin").where({ id }).first();

  return profile;
};
