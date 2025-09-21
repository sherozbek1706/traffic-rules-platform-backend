/**
 * Add question_limit and randomize_questions to tests
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable("tests");
  if (!hasTable) throw new Error("tests table does not exist");
  const hasColLimit = await knex.schema.hasColumn("tests", "question_limit");
  const hasColRand = await knex.schema.hasColumn("tests", "randomize_questions");
  await knex.schema.alterTable("tests", (t) => {
    if (!hasColLimit) t.integer("question_limit").unsigned().nullable().comment("How many questions to show per attempt; null = all");
    if (!hasColRand) t.boolean("randomize_questions").notNullable().defaultTo(true).comment("Randomize question order/selection");
  });
};

exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable("tests");
  if (!hasTable) return;
  await knex.schema.alterTable("tests", (t) => {
    t.dropColumn("question_limit");
    t.dropColumn("randomize_questions");
  });
};
