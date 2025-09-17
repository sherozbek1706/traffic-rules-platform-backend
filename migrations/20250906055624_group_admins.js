/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("group_admins", (table) => {
    table.increments("id").primary();
    table
      .integer("group_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE"); // Guruh o‘chsa, admin aloqalari ham o‘chsin
    table
      .integer("admin_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("admin")
      .onDelete("CASCADE"); // Admin o‘chsa, bog‘lanish ham o‘chsin

    table.unique(["group_id", "admin_id"]); // Bir adminni bitta guruhga qayta qo‘shib bo‘lmasin
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("group_admins");
};
