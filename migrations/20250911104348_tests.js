/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tests", (t) => {
    t.increments("id").primary();
    t.string("title", 255).notNullable();
    t.text("description").nullable();
    t.integer("admin_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("admin")
      .onDelete("CASCADE");

    // Test sozlamalari
    t.integer("time_limit_sec").unsigned().nullable(); // ixtiyoriy: vaqt limiti
    t.boolean("is_published").notNullable().defaultTo(false);

    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tests");
};
