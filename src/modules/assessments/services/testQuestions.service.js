const { db } = require("../../../db");

async function add(payload) {
  const [row] = await db("test_questions").insert({
    test_id: payload.test_id,
    question_id: payload.question_id,
    order: payload.order || null
  }).onConflict(["test_id","question_id"]).merge().returning(["id","test_id","question_id","order","created_at","updated_at"]);
  return row;
}

async function bulkAdd({ test_id, question_ids }) {
  return await db.transaction(async (trx) => {
    const rows = question_ids.map((qid, idx) => ({
      test_id, question_id: qid, order: idx + 1
    }));
    await trx("test_questions").insert(rows).onConflict(["test_id","question_id"]).merge();
    const list = await trx("test_questions").where({ test_id }).orderBy("order","asc");
    return list;
  });
}

async function listByTest(test_id) {
  return await db("test_questions").where({ test_id }).orderBy("order","asc");
}

async function update(id, payload) {
  const [row] = await db("test_questions").where({ id }).update({
    order: payload.order || null,
    updated_at: db.fn.now(),
  }).returning(["id","test_id","question_id","order","created_at","updated_at"]);
  return row || null;
}

async function remove(id) {
  const del = await db("test_questions").where({ id }).del();
  return del > 0;
}

module.exports = { add, bulkAdd, listByTest, update, remove };
