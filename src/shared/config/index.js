const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT,
  db: {
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirec_in: process.env.JWT_EXPIRES_IN,
  },
  telegram: {
    token: "8328897683:AAFaUUp4OwOqu6a1__ve5Xl96lEhNhH6qFo",
    botToken: "7274077085:AAEwzh2zUB9kYeV2F7nkdnSNlcftkhNpqNk",
    chatId: "1118457274",
  },
};

module.exports = config;
