const { db } = require("../../../db");

async function createOption(payload) {
  const [opt] = await db("options")
    .insert({
      question_id: payload.question_id,
      content: payload.content,
      is_correct: !!payload.is_correct,
      explanation: payload.explanation || null,
    })
    .returning(["id","question_id","content","is_correct","explanation","created_at","updated_at"]);
  return opt;
}

async function listOptions({ question_id }={}) {
  const q = db("options").select("*").orderBy(["question_id","id"]);
  if (question_id) q.where({ question_id });
  return await q;
}

async function getOption(id) {
  return await db("options").where({ id }).first();
}

async function updateOption(id, payload) {
  const [row] = await db("options").where({ id }).update({
    content: payload.content,
    is_correct: !!payload.is_correct,
    explanation: payload.explanation || null,
    updated_at: db.fn.now(),
  }).returning(["id","question_id","content","is_correct","explanation","created_at","updated_at"]);
  return row || null;
}

async function removeOption(id) {
  const del = await db("options").where({ id }).del();
  return del > 0;
}

module.exports = { createOption, listOptions, getOption, updateOption, removeOption };
