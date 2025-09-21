const { db } = require("../../../db");
const { NotFoundError } = require("../../../shared/errors");

async function create(payload) {
  const [row] = await db("test_recommendations")
    .insert({
      test_id: payload.test_id,
      title: payload.title,
      description: payload.description || null,
      video_link: payload.video_link || null,
    })
    .returning(["id","test_id","title","description","video_link","created_at","updated_at"]);
  return row;
}

async function listByTest(test_id) {
  return db("test_recommendations")
    .select("id","test_id","title","description","video_link","created_at","updated_at")
    .where({ test_id })
    .orderBy("id","asc");
}

async function update(id, payload) {
  const [row] = await db("test_recommendations")
    .update({
      title: payload.title,
      description: payload.description || null,
      video_link: payload.video_link || null,
      updated_at: db.fn.now(),
    })
    .where({ id })
    .returning(["id","test_id","title","description","video_link","created_at","updated_at"]);
  if (!row) throw new NotFoundError("Recommendation not found");
  return row;
}

async function remove(id) {
  const count = await db("test_recommendations").where({ id }).del();
  if (!count) throw new NotFoundError("Recommendation not found");
}

module.exports = { create, listByTest, update, remove };
