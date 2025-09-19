/**
 * Create student_answers table with upsert target (attempt_id, question_id)
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("student_answers");
  if (!exists) {
    await knex.schema.createTable("student_answers", (table) => {
      table.increments("id").primary();
      table
        .integer("attempt_id")
        .references("id")
        .inTable("attempts")
        .onDelete("CASCADE")
        .notNullable();
      table
        .integer("question_id")
        .references("id")
        .inTable("questions")
        .onDelete("CASCADE")
        .notNullable();
      table
        .integer("option_id")
        .references("id")
        .inTable("options")
        .onDelete("SET NULL")
        .nullable();
      table.timestamp("answered_at").notNullable().defaultTo(knex.fn.now());

      table.timestamps(true, true);

      table.unique(["attempt_id", "question_id"], {"indexName": "uq_student_answers_attempt_question"});
      table.index(["attempt_id"], "idx_student_answers_attempt");
      table.index(["question_id"], "idx_student_answers_question");
      table.index(["option_id"], "idx_student_answers_option");
    });
  }
};

exports.down = async function(knex) {
  const exists = await knex.schema.hasTable("student_answers");
  if (exists) {
    await knex.schema.dropTableIfExists("student_answers");
  }
};
