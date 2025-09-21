/**
 * Create test_recommendations table
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("test_recommendations");
  if (!exists) {
    await knex.schema.createTable("test_recommendations", (t) => {
      t.increments("id").primary();
      t.integer("test_id").unsigned().notNullable()
        .references("id").inTable("tests").onDelete("CASCADE");
      t.string("title", 255).notNullable();
      t.text("description").nullable();
      t.text("video_link").nullable();
      t.timestamps(true, true);
      t.index(["test_id"], "idx_test_recommendations_test");
    });
  }
};

exports.down = async function(knex) {
  const exists = await knex.schema.hasTable("test_recommendations");
  if (exists) await knex.schema.dropTable("test_recommendations");
};
