const bcrypt = require("bcryptjs");

module.exports = async (password) => {
  const res = await bcrypt.hash(password, 10);
  return res;
};
