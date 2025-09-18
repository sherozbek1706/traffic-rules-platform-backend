/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("options", (t) => {
    t.increments("id").primary();
    t.integer("question_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("questions")
      .onDelete("CASCADE");

    t.text("content").notNullable();
    t.boolean("is_correct").notNullable().defaultTo(false);
    t.text("explanation").nullable(); // to‘g‘ri javob uchun izoh (optional)

    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("options");
};
