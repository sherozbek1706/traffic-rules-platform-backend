const { db } = require("../../../db");

async function createTest(payload) {
  const [test] = await db("tests")
    .insert({
      title: payload.title,
      description: payload.description || null,
      time_limit_sec: payload.time_limit_sec || null,
      admin_id: payload.admin_id || null,
      is_published: false,
    })
    .returning([
      "id",
      "title",
      "description",
      "time_limit_sec",
      "admin_id",
      "is_published",
      "created_at",
      "updated_at",
    ]);
  return test;
}

async function listTests() {
  return await db("tests").select("*").orderBy("id", "desc");
}

// async function getTest(id) {
//   const test = await db("tests").where({ id }).first();
//   if (!test) return null;
//   const questions = await db("questions")
//     .join("test_questions", "questions.id", "=", "test_questions.question_id")
//     .where("test_questions.test_id", id)
//     .select(
//       "questions.id",
//       "questions.content",
//       "questions.image_url",
//       "test_questions.order"
//     )
//     .orderBy([
//       { column: "test_questions.order", order: "asc" },
//       { column: "questions.id", order: "asc" },
//     ]);
//   const ids = questions.map((q) => q.id);
//   let optionsByQ = {};
//   if (ids.length) {
//     const opts = await db("options")
//       .whereIn("question_id", ids)
//       .orderBy(["question_id", "id"]);
//     for (const o of opts) {
//       (optionsByQ[o.question_id] = optionsByQ[o.question_id] || []).push(o);
//     }
//   }
//   return {
//     ...test,
//     questions: questions.map((q) => ({
//       ...q,
//       options: optionsByQ[q.id] || [],
//     })),
//   };
// }

// async function getTest(id) { ... } ni almashtiring

async function getTest(id) {
  const test = await db("tests").where({ id }).first();
  if (!test) return null;

  // 1) Savollarni tartib bilan olamiz (order saqlanadi, lekin keyin aralashtiramiz)
  const questionsRaw = await db("questions")
    .join("test_questions", "questions.id", "=", "test_questions.question_id")
    .where("test_questions.test_id", id)
    .select(
      "questions.id",
      "questions.content",
      "questions.image_url",
      "test_questions.order"
    )
    .orderBy([
      { column: "test_questions.order", order: "asc" },
      { column: "questions.id", order: "asc" },
    ]);

  const ids = questionsRaw.map((q) => q.id);

  // 2) Variantlarni olib, question_id bo‘yicha guruhlaymiz
  let optionsByQ = {};
  if (ids.length) {
    const opts = await db("options").whereIn("question_id", ids); // tartib shart emas; baribir aralashtiramiz
    for (const o of opts) {
      (optionsByQ[o.question_id] = optionsByQ[o.question_id] || []).push(o);
    }
  }

  // 3) Shuffle helper (Fisher–Yates)
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 4) Savollarni va har bir savol ichidagi variantlarni ARALASHTIRIB qaytaramiz
  const questions = shuffle(
    questionsRaw.map((q) => ({
      ...q,
      options: shuffle(optionsByQ[q.id] || []),
    }))
  );

  return {
    ...test,
    questions,
  };
}

async function updateTest(id, payload) {
  const [row] = await db("tests")
    .where({ id })
    .update({
      title: payload.title,
      description: payload.description || null,
      time_limit_sec: payload.time_limit_sec || null,
      updated_at: db.fn.now(),
    })
    .returning([
      "id",
      "title",
      "description",
      "time_limit_sec",
      "admin_id",
      "is_published",
      "created_at",
      "updated_at",
    ]);
  return row || null;
}

async function setPublish(id, value) {
  // Verify there is at least one linked question when publishing
  if (value) {
    const countRow = await db("test_questions")
      .where({ test_id: id })
      .count("* as c")
      .first();
    const c = Number(countRow?.c || 0);
    if (c === 0) {
      const err = new Error("Cannot publish: test has no linked questions.");
      err.code = "NO_QUESTIONS";
      throw err;
    }
  }
  const [row] = await db("tests")
    .where({ id })
    .update({ is_published: !!value, updated_at: db.fn.now() })
    .returning(["id", "title", "is_published", "updated_at"]);
  return row || null;
}

async function removeTest(id) {
  const del = await db("tests").where({ id }).del();
  return del > 0;
}

module.exports = {
  createTest,
  listTests,
  getTest,
  updateTest,
  setPublish,
  removeTest,
};
