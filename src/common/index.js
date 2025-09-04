const middleFunction = require("./controller/middle-function");

const common = {
  response: {
    list: require("./response/list"),
  },
  controller: {
    "middle-function": require("./controller/middle-function"),
  },
  checkings: {
    phone_number: require("./checking/phone_number"),
    exist: require("./checking/exist"),
    found: require("./checking/found"),
    passport: require("./checking/passport"),
  },
  helper: {
    hashPassword: require("./helper/hashPassword"),
  },
};

module.exports = common;
