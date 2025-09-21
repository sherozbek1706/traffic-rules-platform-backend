/**
 * Create attempt_questions table
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("attempt_questions");
  if (!exists) {
    await knex.schema.createTable("attempt_questions", (t) => {
      t.increments("id").primary();
      t.integer("attempt_id").unsigned().notNullable()
        .references("id").inTable("attempts").onDelete("CASCADE");
      t.integer("question_id").unsigned().notNullable()
        .references("id").inTable("questions").onDelete("CASCADE");
      t.integer("position").unsigned().notNullable().defaultTo(1);
      t.timestamps(true, true);
      t.unique(["attempt_id","question_id"]);
      t.index(["attempt_id","position"], "idx_attempt_questions_attempt_pos");
    });
  }
};

exports.down = async function(knex) {
  const exists = await knex.schema.hasTable("attempt_questions");
  if (exists) await knex.schema.dropTable("attempt_questions");
};
