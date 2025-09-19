/**
 * Create attempts table
 * - snapshot time_limit_sec from tests when starting
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("attempts");
  if (!exists) {
    await knex.schema.createTable("attempts", (table) => {
      table.increments("id").primary();
      table
        .integer("student_id")
        .references("id")
        .inTable("students")
        .onDelete("CASCADE")
        .notNullable();
      table
        .integer("test_id")
        .references("id")
        .inTable("tests")
        .onDelete("CASCADE")
        .notNullable();
      table.timestamp("start_time").notNullable().defaultTo(knex.fn.now());
      table.timestamp("end_time").notNullable();
      table.integer("time_limit_sec");
      table.decimal("score", 6, 2).notNullable().defaultTo(0);
      table.boolean("is_finished").notNullable().defaultTo(false);
      table.timestamps(true, true);

      table.index(["student_id", "test_id"], "idx_attempts_student_test");
      table.index(["student_id", "is_finished"], "idx_attempts_student_finished");
      table.index(["test_id", "is_finished"], "idx_attempts_test_finished");
    });
  }
};

exports.down = async function(knex) {
  const exists = await knex.schema.hasTable("attempts");
  if (exists) {
    await knex.schema.dropTableIfExists("attempts");
  }
};
