// src/modules/students/stats.service.js
const { db } = require("../../../db"); // <- loyihangizdagi knex instance yo'lini moslang

/**
 * Student bo'yicha to'liq statistika.
 * - attempts: a.test_id, test title, score, is_finished, start/end, time_limit
 * - har attempt uchun answered_count / correct_count
 * - umumiy totals
 * - per_test agregatlar
 */
module.exports = async ({ params }) => {
  let { id: studentId } = params;
  // 1) Student borligini tekshiramiz (ixtiyoriy, lekin foydali)
  const student = await db("students")
    .select("id", "username", "first_name", "last_name", "group_id")
    .where({ id: studentId })
    .first();

  if (!student) {
    const err = new Error("Student topilmadi");
    err.status = 404;
    throw err;
  }

  // 2) Student attempts ro'yxati (test title bilan)
  const attempts = await db("attempts as a")
    .join("tests as t", "t.id", "a.test_id")
    .where("a.student_id", studentId)
    .orderBy("a.start_time", "desc")
    .select(
      "a.id",
      "a.test_id",
      "t.title as test_title",
      "a.start_time",
      "a.end_time",
      "a.time_limit_sec",
      "a.score",
      "a.is_finished"
    );

  if (!attempts.length) {
    return {
      student,
      totals: {
        attempts_count: 0,
        tests_taken_count: 0,
        avg_score: 0,
        last_attempt_at: null,
      },
      per_test: [],
      attempts: [],
    };
  }

  // 3) Har attempt bo‘yicha answered/correct agregatlari
  const attemptIds = attempts.map((a) => a.id);

  // Postgres uchun raw summalar:
  // correct_count = SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END)
  // answered_count = COUNT(*)
  const aggRows = await db
    .raw(
      `
      SELECT sa.attempt_id,
             COUNT(*)::int AS answered_count,
             SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END)::int AS correct_count
      FROM student_answers sa
      LEFT JOIN options o ON o.id = sa.option_id
      WHERE sa.attempt_id = ANY (?)
      GROUP BY sa.attempt_id
    `,
      [attemptIds]
    )
    .then((r) => r.rows || r); // pg vs sqlite compat (pg: r.rows)

  const aggByAttempt = new Map();
  for (const row of aggRows) {
    aggByAttempt.set(row.attempt_id, {
      answered_count: Number(row.answered_count || 0),
      correct_count: Number(row.correct_count || 0),
    });
  }

  // 4) JS da kompozitsiya
  const attemptsDecorated = attempts.map((a) => {
    const nums = aggByAttempt.get(a.id) || {
      answered_count: 0,
      correct_count: 0,
    };

    // score ba'zan string bo'lib kelishi mumkin — floatga o'giramiz
    const scoreNum =
      a.score == null ? null : Number.isFinite(+a.score) ? +a.score : null;

    return {
      id: a.id,
      test_id: a.test_id,
      test_title: a.test_title,
      start_time: a.start_time,
      end_time: a.end_time,
      time_limit_sec: a.time_limit_sec,
      score: scoreNum,
      is_finished: !!a.is_finished,
      answered_count: nums.answered_count,
      correct_count: nums.correct_count,
      // ixtiyoriy: taxminiy duration (sekund)
      duration_sec:
        a.start_time && a.end_time
          ? Math.max(
              0,
              Math.floor(
                (new Date(a.end_time).getTime() -
                  new Date(a.start_time).getTime()) /
                  1000
              )
            )
          : null,
    };
  });

  // 5) Totals
  const attempts_count = attemptsDecorated.length;
  const tests_taken_count = new Set(attemptsDecorated.map((x) => x.test_id))
    .size;
  const scored = attemptsDecorated
    .map((x) => x.score)
    .filter((x) => typeof x === "number" && !isNaN(x));
  const avg_score =
    scored.length > 0
      ? Math.round((scored.reduce((s, v) => s + v, 0) / scored.length) * 100) /
        100
      : 0;
  const last_attempt_at = attemptsDecorated[0]?.start_time || null;

  // 6) Per-test agregatlar
  const perTestMap = new Map();
  for (const a of attemptsDecorated) {
    if (!perTestMap.has(a.test_id)) {
      perTestMap.set(a.test_id, {
        test_id: a.test_id,
        test_title: a.test_title,
        attempts: [],
      });
    }
    perTestMap.get(a.test_id).attempts.push(a);
  }

  const per_test = [];
  for (const entry of perTestMap.values()) {
    // vaqt bo‘yicha tartib
    entry.attempts.sort(
      (x, y) =>
        new Date(y.start_time).getTime() - new Date(x.start_time).getTime()
    );

    const scores = entry.attempts
      .map((x) => x.score)
      .filter((x) => typeof x === "number" && !isNaN(x));
    const attempts_count_test = entry.attempts.length;
    const avg_score_test =
      scores.length > 0
        ? Math.round(
            (scores.reduce((s, v) => s + v, 0) / scores.length) * 100
          ) / 100
        : 0;
    const best_score_test = scores.length > 0 ? Math.max(...scores) : null;
    const last_score_test =
      entry.attempts.find((x) => typeof x.score === "number")?.score ?? null;

    per_test.push({
      test_id: entry.test_id,
      test_title: entry.test_title,
      attempts_count: attempts_count_test,
      avg_score: avg_score_test,
      best_score: best_score_test,
      last_score: last_score_test,
      last_attempt_at: entry.attempts[0]?.start_time || null,
      attempts: entry.attempts, // to'liq attemptlar ro'yxati
    });
  }

  return {
    student,
    totals: {
      attempts_count,
      tests_taken_count,
      avg_score,
      last_attempt_at,
    },
    per_test,
    attempts: attemptsDecorated, // tekis ro'yxat ham kerak bo'lsa
  };
};
