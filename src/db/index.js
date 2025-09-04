const knex = require("knex");

const config = require("../shared/config");

/**
 *
 */
const db = knex.knex({
  client: "postgresql",
  connection: {
    database: config.db.database,
    user: config.db.username,
    password: config.db.password,
    port: config.db.port,
  },
});

module.exports = { db };
