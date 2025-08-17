const { phoneNumberRegEx } = require("../../constants");
const { BadRequestError } = require("../../shared/errors");
module.exports = (phone_number) => {
  let test = phoneNumberRegEx.test(phone_number);

  if (!test) {
    throw new BadRequestError("Telefon raqam noto'g'ri kiritildi!");
  }
};
