const { db } = require("../../../db");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../../../shared/errors");

// services/index.js (yuqoriga qo‘ying)
async function ensureSelectionForAttempt(attempt) {
  const [{ c }] = await db("attempt_questions")
    .where({ attempt_id: attempt.id })
    .count({ c: "*" });
  if (Number(c || 0) > 0) return;

  const test = await getTest(attempt.test_id);

  let baseQ = db("test_questions")
    .where({ test_id: attempt.test_id })
    .select("question_id");
  if (test.randomize_questions !== false) {
    baseQ = baseQ.orderByRaw("random()");
  } else {
    baseQ = db("test_questions")
      .where({ test_id: attempt.test_id })
      .orderBy("order", "asc")
      .select("question_id");
  }
  if (test.question_limit && Number.isInteger(test.question_limit)) {
    baseQ = baseQ.limit(test.question_limit);
  }
  const rows = await baseQ;

  if (rows.length) {
    const inserts = rows.map((r, idx) => ({
      attempt_id: attempt.id,
      question_id: r.question_id,
      position: idx + 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    }));
    await db.batchInsert("attempt_questions", inserts, 100);
  }
}

async function getTest(testId) {
  const test = await db("tests").first("*").where({ id: testId });
  if (!test) throw new NotFoundError("Test not found");
  return test;
}

async function ensureAttemptAccess(attemptId, user) {
  const attempt = await db("attempts").first("*").where({ id: attemptId });
  if (!attempt) throw new NotFoundError("Attempt not found");
  if (user.role === "student" && attempt.student_id !== user.id) {
    throw new ForbiddenError("You cannot access this attempt");
  }
  return attempt;
}

/**
 * Start attempt: create attempt row, pick random subset of questions based on test.question_limit,
 * persist selection in attempt_questions, and return attempt + selected questions (+ options).
 */
async function startAttempt({ studentId, testId }) {
  const test = await getTest(testId);

  // Existing unfinished attempt?
  const existing = await db("attempts")
    .first("*")
    .where({ student_id: studentId, test_id: testId, is_finished: false });
  if (existing) {
    await ensureSelectionForAttempt(existing); // <— qo‘shing

    // Return with selected questions (from attempt_questions) to keep consistency
    return await getAttempt({
      attemptId: existing.id,
      user: { id: studentId, role: "student" },
    });
  }

  // Snapshot time limit if any
  const time_limit_sec = test.time_limit_sec || null;

  const endTime = time_limit_sec
    ? db.raw(`NOW() + interval '${time_limit_sec} second'`)
    : null;

  const [attempt] = await db("attempts")
    .insert({
      student_id: studentId,
      test_id: testId,
      is_finished: false,
      time_limit_sec: time_limit_sec,
      start_time: db.fn.now(),
      end_time: endTime,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning("*");

  // Create attempt
  // const [attempt] = await db("attempts")
  //   .insert({
  //     student_id: studentId,
  //     test_id: testId,
  //     is_finished: false,
  //     time_limit_sec_snapshot: time_limit_sec,
  //     created_at: db.fn.now(),
  //     updated_at: db.fn.now(),
  //   })
  //   .returning("*");

  // Build base query of question ids for the test
  // Keep test_questions.order as-is in DB; selection will be random if randomize_questions = true
  let baseQ = db("test_questions")
    .where({ test_id: testId })
    .select("question_id");
  if (test.randomize_questions !== false) {
    baseQ = baseQ.orderByRaw("random()");
  } else {
    // If not randomizing, use stored order
    baseQ = db("test_questions")
      .where({ test_id: testId })
      .orderBy("order", "asc")
      .select("question_id");
  }
  if (test.question_limit && Number.isInteger(test.question_limit)) {
    baseQ = baseQ.limit(test.question_limit);
  }
  const rows = await baseQ;

  const selectedIds = rows.map((r) => r.question_id);
  // Persist into attempt_questions with position 1..n
  if (selectedIds.length > 0) {
    const inserts = selectedIds.map((qid, idx) => ({
      attempt_id: attempt.id,
      question_id: qid,
      position: idx + 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    }));
    await db.batchInsert("attempt_questions", inserts, 100);
  }

  return await getAttempt({
    attemptId: attempt.id,
    user: { id: studentId, role: "student" },
  });
}

/**
 * Upsert student's answer for a question within an attempt.
 */
async function answerUpsert({ attemptId, questionId, optionId, user }) {
  const attempt = await ensureAttemptAccess(attemptId, user);
  if (attempt.is_finished)
    throw new BadRequestError("Attempt already finished");

  await ensureSelectionForAttempt(attempt); // <— qo‘shing

  // Ensure the question belongs to this attempt selection
  const hasQ = await db("attempt_questions")
    .first("id")
    .where({ attempt_id: attempt.id, question_id: questionId });
  if (!hasQ) throw new BadRequestError("Question is not part of this attempt");

  // Ensure option belongs to the same question (if optionId provided)
  if (optionId) {
    const opt = await db("options")
      .first("id", "question_id")
      .where({ id: optionId });
    if (!opt || opt.question_id !== questionId)
      throw new BadRequestError("Option does not belong to the question");
  }

  // Upsert into student_answers (column is `option_id`, not `selected_option_id`)
  const existing = await db("student_answers")
    .first("*")
    .where({ attempt_id: attempt.id, question_id: questionId });

  if (existing) {
    const [row] = await db("student_answers")
      // .update({ selected_option_id: optionId || null, updated_at: db.fn.now() })
      .update({
        option_id: optionId || null,
        answered_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .where({ id: existing.id })
      .returning("*");
    return row;
  } else {
    const [row] = await db("student_answers")
      .insert({
        attempt_id: attempt.id,
        question_id: questionId,
        // selected_option_id: optionId || null,
        option_id: optionId || null,
        answered_at: db.fn.now(),
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");
    return row;
  }
}

/**
 * Finish attempt: mark finished and compute score (percentage of correct answers among selected questions).
 */
async function finishAttempt({ attemptId, user }) {
  const attempt = await ensureAttemptAccess(attemptId, user);
  if (attempt.is_finished) return attempt;

  // Determine selected questions for this attempt
  const selected = await db("attempt_questions")
    .where({ attempt_id: attempt.id })
    .select("question_id");
  const questionIds = selected.map((r) => r.question_id);
  if (questionIds.length === 0) {
    // fallback: if selection not persisted for some reason, use all test questions
    const fallback = await db("test_questions")
      .where({ test_id: attempt.test_id })
      .select("question_id");
    questionIds.push(...fallback.map((r) => r.question_id));
  }

  // Count total
  const total = questionIds.length;

  // Count correct by joining answers with options.is_correct
  let correct = 0;
  if (total > 0) {
    // const rows = await db("student_answers as sa")
    //   .join("options as o", "o.id", "sa.selected_option_id")
    const rows = await db("student_answers as sa")
      .join("options as o", "o.id", "sa.option_id")
      .where("sa.attempt_id", attempt.id)
      .whereIn("sa.question_id", questionIds)
      .andWhere("o.is_correct", true)
      .count({ c: "*" });
    correct = Number(rows?.[0]?.c || 0);
  }

  const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

  const [updated] = await db("attempts")
    .update({ is_finished: true, score, updated_at: db.fn.now() })
    .where({ id: attempt.id })
    .returning("*");

  return updated;
}

/**
 * Get attempt details with selected questions and options
 */
// async function getAttempt({ attemptId, user }) {
//   const attempt = await ensureAttemptAccess(attemptId, user);
//   const isStudent = user?.role === "student";

//   // Selected questions for this attempt ordered by position
//   const aq = await db("attempt_questions as aq")
//     .join("questions as q", "q.id", "aq.question_id")
//     .where("aq.attempt_id", attempt.id)
//     .orderBy("aq.position", "asc")
//     .select(
//       "q.id as id",
//       "q.content as content",
//       "q.image_url as image_url",
//       "aq.position as position"
//     );

//   // If selection not present (older attempts), fallback to all test questions in stored order
//   let questions = aq;
//   if (!questions.length) {
//     questions = await db("test_questions as tq")
//       .join("questions as q", "q.id", "tq.question_id")
//       .where("tq.test_id", attempt.test_id)
//       .orderBy("tq.order", "asc")
//       .select("q.id as id", "q.content as content", "q.image_url as image_url");
//   }

//   // Fetch options for these questions
//   const qIds = questions.map((q) => q.id);
//   const options = qIds.length
//     ? await db("options")
//         .whereIn("question_id", qIds)
//         .orderBy("id", "asc")
//         .select("*")
//     : [];
//   // const optionsByQ = options.reduce((acc, o) => {
//   //   (acc[o.question_id] = acc[o.question_id] || []).push({
//   //     id: o.id,
//   //     question_id: o.question_id,
//   //     content: o.content,
//   //     is_correct: !!o.is_correct, // NOTE: ideally hide this from student APIs
//   //     explanation: o.explanation,
//   //   });
//   //   return acc;
//   // }, {});

//   // Also include current answers

//   const revealAnswers = !isStudent || !!attempt.is_finished;
//   const optionsByQ = options.reduce((acc, o) => {
//     (acc[o.question_id] = acc[o.question_id] || []).push(
//       revealAnswers
//         ? {
//             id: o.id,
//             question_id: o.question_id,
//             content: o.content,
//             is_correct: !!o.is_correct,
//             explanation: o.explanation,
//           }
//         : {
//             id: o.id,
//             question_id: o.question_id,
//             content: o.content,
//           }
//     );
//     return acc;
//   }, {});

//   const answersRows = await db("student_answers")
//     .where({ attempt_id: attempt.id })
//     .select("*");
//   const answersByQ = answersRows.reduce((acc, a) => {
//     acc[a.question_id] = a;
//     return acc;
//   }, {});

//   // Root-level slim array -> AttemptResult kutadigan format
//   const answers = answersRows.map((a) => ({
//     question_id: a.question_id,
//     option_id: a.option_id ?? null,
//   }));

//   const payload = {
//     ...attempt,
//     answers,
//     questions: questions.map((q) => ({
//       id: q.id,
//       content: q.content,
//       image_url: q.image_url,
//       position: q.position || null,
//       options: optionsByQ[q.id] || [],
//       answer: answersByQ[q.id] || null,
//     })),
//   };
//   return payload;
// }

async function getAttempt({ attemptId, user }) {
  const attempt = await ensureAttemptAccess(attemptId, user);
  const isStudent = user?.role === "student";

  // Selected questions for this attempt ordered by position
  const aq = await db("attempt_questions as aq")
    .join("questions as q", "q.id", "aq.question_id")
    .where("aq.attempt_id", attempt.id)
    .orderBy("aq.position", "asc")
    .select(
      "q.id as id",
      "q.content as content",
      "q.image_url as image_url",
      "aq.position as position"
    );

  // If selection not present (older attempts), fallback to all test questions in stored order
  let questions = aq;
  if (!questions.length) {
    questions = await db("test_questions as tq")
      .join("questions as q", "q.id", "tq.question_id")
      .where("tq.test_id", attempt.test_id)
      .orderBy("tq.order", "asc")
      .select(
        "q.id as id",
        "q.content as content",
        "q.image_url as image_url",
        db.raw('COALESCE(tq."order", 0) as position')
      );
  }

  // Fetch options for these questions
  const qIds = questions.map((q) => q.id);
  const options = qIds.length
    ? await db("options")
        .whereIn("question_id", qIds)
        .orderBy("id", "asc")
        .select("*")
    : [];

  // Hide correctness for students until attempt is finished
  const revealAnswers = !isStudent || !!attempt.is_finished;
  const optionsByQ = options.reduce((acc, o) => {
    (acc[o.question_id] = acc[o.question_id] || []).push(
      revealAnswers
        ? {
            id: o.id,
            question_id: o.question_id,
            content: o.content,
            is_correct: !!o.is_correct,
            explanation: o.explanation,
          }
        : {
            id: o.id,
            question_id: o.question_id,
            content: o.content,
          }
    );
    return acc;
  }, {});

  // Current answers
  const answersRows = await db("student_answers")
    .where({ attempt_id: attempt.id })
    .select("*");

  const answersByQ = answersRows.reduce((acc, a) => {
    acc[a.question_id] = a;
    return acc;
  }, {});

  // Slim answers array for root
  const answers = answersRows.map((a) => ({
    question_id: a.question_id,
    option_id: a.option_id ?? null,
  }));

  // ✅ NEW: recommendations for this test (ordered by newest first or title asc — tanlov sizniki)
  const recommendations = await db("test_recommendations")
    .where({ test_id: attempt.test_id })
    .orderBy("id", "desc")
    .select(
      "id",
      "test_id",
      "title",
      "description",
      "video_link",
      "created_at",
      "updated_at"
    );

  // Build payload
  const payload = {
    ...attempt,
    answers,
    questions: questions.map((q) => ({
      id: q.id,
      content: q.content,
      image_url: q.image_url,
      position: q.position || null,
      options: optionsByQ[q.id] || [],
      answer: answersByQ[q.id] || null,
    })),
    recommendations, // ⬅️ shu yerda yuboriladi
  };

  return payload;
}

module.exports = {
  startAttempt,
  answerUpsert,
  finishAttempt,
  getAttempt,
};
