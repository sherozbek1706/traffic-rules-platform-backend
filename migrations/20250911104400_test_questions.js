/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("test_questions", (t) => {
    t.increments("id").primary();
    t.integer("test_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("tests")
      .onDelete("CASCADE");
    t.integer("question_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("questions")
      .onDelete("CASCADE");
    t.integer("order").unsigned().nullable(); // savollar ketma-ketligi
    t.timestamps(true, true);

    // 🔑 UNIQUE constraint qo‘shamiz
    t.unique(["test_id", "question_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("test_questions");
};
