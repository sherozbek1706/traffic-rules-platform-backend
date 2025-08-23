
const service = require("./services");
const isLoggedIn = require("../../shared/auth/_isLoggedIn");

/**
 * POST /api/v1/tests/:id/start  (also available under /api/v1/assessments/tests/:id/start if router mounts it)
 */
async function start(req, res, next) {
  try {
    const testId = Number(req.params.id);
    if (!testId) return res.status(400).json({ message: "Invalid test id" });
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const attempt = await service.startAttempt({ studentId, testId });
    res.json({ data: attempt });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/v1/attempts/:attemptId/answer
 * body: { question_id, option_id }
 */
async function answer(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const { question_id, option_id } = req.body || {};
    if (!attemptId || !question_id)
      return res.status(400).json({ message: "attemptId and question_id are required" });

    const row = await service.answerUpsert({
      attemptId,
      studentId: req.user?.id,
      questionId: Number(question_id),
      optionId: option_id == null ? null : Number(option_id),
    });
    res.json({ data: row });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/v1/attempts/:attemptId/finish
 */
async function finish(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    if (!attemptId) return res.status(400).json({ message: "Invalid attempt id" });
    const result = await service.finishAttempt({ attemptId, user: req.user });
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/v1/attempts/:attemptId
 */
async function getOne(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    if (!attemptId) return res.status(400).json({ message: "Invalid attempt id" });
    const result = await service.getAttempt({ attemptId, user: req.user });
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  start,
  answer,
  finish,
  getOne,
  isLoggedIn,
};
