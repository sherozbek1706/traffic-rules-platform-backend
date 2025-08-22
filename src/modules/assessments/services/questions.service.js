const { db } = require("../../../db");

async function createQuestionWithOptions({ content, admin_id, image_url, options }) {
  return await db.transaction(async (trx) => {
    const [q] = await trx("questions")
      .insert({ content, admin_id: admin_id || null, image_url: image_url || null })
      .returning(["id","content","image_url","admin_id","created_at","updated_at"]);
    const rows = options.map(o => ({
      question_id: q.id,
      content: o.content,
      is_correct: !!o.is_correct,
      explanation: o.explanation || null,
    }));
    await trx("options").insert(rows);
    return q;
  });
}

async function listQuestions({ with_options }) {
  const qs = await db("questions").select("*").orderBy("id","desc");
  if (!with_options) return qs;
  const ids = qs.map(q => q.id);
  const opts = ids.length ? await db("options").whereIn("question_id", ids).orderBy(["question_id","id"]) : [];
  const byQ = {};
  for (const o of opts) {
    byQ[o.question_id] = byQ[o.question_id] || [];
    byQ[o.question_id].push(o);
  }
  return qs.map(q => ({ ...q, options: byQ[q.id] || [] }));
}

async function getQuestionWithOptions(id) {
  const q = await db("questions").where({ id }).first();
  if (!q) return null;
  const opts = await db("options").where({ question_id: id }).orderBy("id","asc");
  return { ...q, options: opts };
}

async function updateQuestionWithUpsert(id, { content, image_url, options }) {
  return await db.transaction(async (trx) => {
    const exists = await trx("questions").where({ id }).first();
    if (!exists) return null;

    await trx("questions").where({ id }).update({ content, image_url: image_url ?? exists.image_url, updated_at: trx.fn.now() });

    const existing = await trx("options").where({ question_id: id });
    const existingMap = new Map(existing.map(o => [o.id, o]));

    const seen = new Set();
    for (const o of options) {
      if (o.id && existingMap.has(o.id)) {
        await trx("options").where({ id: o.id, question_id: id })
          .update({ content: o.content, is_correct: !!o.is_correct, explanation: o.explanation || null, updated_at: trx.fn.now() });
        seen.add(o.id);
      } else {
        const [row] = await trx("options").insert({
          question_id: id,
          content: o.content,
          is_correct: !!o.is_correct,
          explanation: o.explanation || null,
        }).returning(["id"]);
        seen.add(row.id);
      }
    }

    // delete missing ones
    const toDelete = [...existingMap.keys()].filter(k => !seen.has(k));
    if (toDelete.length) {
      await trx("options").whereIn("id", toDelete).andWhere({ question_id: id }).del();
    }

    return await getQuestionWithOptions(id);
  });
}

async function removeQuestion(id) {
  const del = await db("questions").where({ id }).del();
  return del > 0;
}

module.exports = {
  createQuestionWithOptions,
  listQuestions,
  getQuestionWithOptions,
  updateQuestionWithUpsert,
  removeQuestion,
};
