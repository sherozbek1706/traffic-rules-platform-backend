/**
 * @param { import("knex").Knex } knex
 */

exports.up = async function (knex) {
  await knex.schema.createTable("groups", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("groups");
};
