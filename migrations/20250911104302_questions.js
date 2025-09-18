/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("questions", (t) => {
    t.increments("id").primary();
    t.text("content").notNullable();
    t.text("image_url").nullable(); // savol uchun rasm (optional)

    t.integer("admin_id")
      .unsigned()
      .references("id")
      .inTable("admin")
      .onDelete("SET NULL");

    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("questions");
};
