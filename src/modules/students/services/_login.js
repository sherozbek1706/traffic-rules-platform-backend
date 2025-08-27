const common = require("../../../common");
const bcrypt = require("bcryptjs");
const { ForbiddenError } = require("../../../shared/errors");
const jwt = require("jsonwebtoken");
const config = require("../../../shared/config");

module.exports = async ({ body }) => {
  const { username, password } = body;

  const found = await common.checkings.found("students", { username }, "Talaba");
  const isCorrect = await bcrypt.compare(password, found.password);
  if (!isCorrect) {
    throw new ForbiddenError("Parol noto'g'ri!");
  }

  const payload = {
    user: {
      id: found.id,
      role: "student",
      created_time: new Date(),
    },
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expirec_in,
  });

  return { token };
};
