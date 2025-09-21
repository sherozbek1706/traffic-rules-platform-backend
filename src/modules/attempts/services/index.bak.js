const { db } = require("../../../db");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../../../shared/errors");

async function getTest(testId) {
  const test = await db("tests").first("*").where({ id: testId });
  if (!test) throw new NotFoundError("Test not found");
  return test;
}

async function ensureAttemptAccess(attemptId, user) {
  const attempt = await db("attempts").first("*").where({ id: attemptId });
  if (!attempt) throw new NotFoundError("Attempt not found");

  // If user has role admin/super_admin -> allow; else must match student_id
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    if (!user || attempt.student_id !== user.id) {
      throw new ForbiddenError("You cannot access this attempt");
    }
  }
  return attempt;
}

async function startAttempt({ studentId, testId }) {
  const test = await getTest(testId);
  const now = new Date();

  // Find active unfinished attempt for this student+test that is still within time
  const existing = await db("attempts")
    .where({ student_id: studentId, test_id: testId, is_finished: false })
    .orderBy("id", "desc")
    .first();

  if (existing) {
    const end = new Date(existing.end_time);
    if (now <= end) {
      // return existing running attempt
      return existing;
    }
  }

  const timeLimit = Number(test.time_limit_sec || 0);
  const end = new Date(now.getTime() + timeLimit * 1000);

  const [row] = await db("attempts")
    .insert({
      student_id: studentId,
      test_id: testId,
      start_time: now,
      end_time: end,
      time_limit_sec: timeLimit,
      score: 0,
      is_finished: false,
    })
    .returning("*");

  return row;
}

async function answerUpsert({ attemptId, studentId, questionId, optionId }) {
  // access control & time
  const attempt = await ensureAttemptAccess(attemptId, {
    id: studentId,
    role: "student",
  });
  if (attempt.is_finished)
    throw new BadRequestError("Attempt already finished");

  const now = new Date();
  if (now > new Date(attempt.end_time)) {
    throw new BadRequestError("Time is over");
  }

  // validate question belongs to test
  const link = await db("test_questions")
    .first("*")
    .where({ test_id: attempt.test_id, question_id: questionId });
  if (!link) throw new BadRequestError("Question does not belong to this test");

  // validate option belongs to question (if provided)
  if (optionId != null) {
    const opt = await db("options")
      .first("id")
      .where({ id: optionId, question_id: questionId });
    if (!opt)
      throw new BadRequestError("Option does not belong to the question");
  }

  const payload = {
    attempt_id: attemptId,
    question_id: questionId,
    option_id: optionId || null,
    answered_at: new Date(),
  };

  // Upsert using Postgres ON CONFLICT
  const upsertSql =
    db("student_answers").insert(payload).toString() +
    " ON CONFLICT (attempt_id, question_id) DO UPDATE SET option_id = EXCLUDED.option_id, answered_at = EXCLUDED.answered_at RETURNING *";

  const [row] = await db.raw(upsertSql).then((r) => r.rows);
  return row;
}

async function finishAttempt({ attemptId, user }) {
  const attempt = await ensureAttemptAccess(attemptId, user);

  // calculate score = % correct
  // total questions for the test
  const [{ count: totalStr }] = await db("test_questions")
    .count("*")
    .where({ test_id: attempt.test_id });
  const total = Number(totalStr || 0);

  let correct = 0;
  if (total > 0) {
    const rows = await db("student_answers as sa")
      .join("options as o", "sa.option_id", "o.id")
      .where("sa.attempt_id", attemptId)
      .andWhere("o.is_correct", true)
      .count("* as c");
    correct = Number(rows?.[0]?.c || 0);
  }

  const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

  const [updated] = await db("attempts")
    .update({ is_finished: true, score })
    .where({ id: attemptId })
    .returning("*");

  return {
    ...updated,
    meta: { total_questions: total, correct_answers: correct },
  };
}

async function getAttempt({ attemptId, user }) {
  const attempt = await ensureAttemptAccess(attemptId, user);

  // answers with correctness
  const answers = await db("student_answers as sa")
    .leftJoin("questions as q", "sa.question_id", "q.id")
    .leftJoin("options as o", "sa.option_id", "o.id")
    .select(
      "sa.id",
      "sa.question_id",
      "sa.option_id",
      "sa.answered_at",
      "q.content as question_content",
      "o.content as option_content",
      "o.is_correct as is_correct"
    )
    .where("sa.attempt_id", attempt.id)
    .orderBy("sa.id", "asc");

  return { attempt, answers };
}

module.exports = {
  startAttempt,
  answerUpsert,
  finishAttempt,
  getAttempt,
};
