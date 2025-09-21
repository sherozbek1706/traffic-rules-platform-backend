const service = require("./services");
const isLoggedIn = require("../../shared/auth/_isLoggedIn");

function buildFullUrl(req, rel) {
  if (!rel) return null;
  const base = req.protocol + "://" + req.get("host");
  return rel.startsWith("http") ? rel : base + rel;
}

function formatAttemptResponse(req, attempt) {
  // question.image_url va option.explanation (agar bo‘lsa) ni full URL qilamiz
  const questions = attempt.questions.map((q) => ({
    ...q,
    image_url: buildFullUrl(req, q.image_url),
    options: q.options.map((o) => ({
      ...o,
      // agar explanation’da ham URL bo‘lsa, xuddi shunday to‘liq qilsa ham bo‘ladi
    })),
  }));

  return {
    ...attempt,
    questions,
  };
}

/**
 * POST /api/v1/attempts/tests/:id/start
 */
// async function start(req, res, next) {
//   try {
//     const testId = Number(req.params.id);
//     if (!testId) return res.status(400).json({ message: "Invalid test id" });
//     const studentId = req.user?.id;
//     if (!studentId) return res.status(401).json({ message: "Unauthorized" });

//     const attempt = await service.startAttempt({ studentId, testId });
//     res.json({ data: attempt });
//   } catch (e) {
//     next(e);
//   }
// }

async function start(req, res, next) {
  try {
    const testId = Number(req.params.id);
    if (!testId) return res.status(400).json({ message: "Invalid test id" });

    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const attempt = await service.startAttempt({ studentId, testId });

    // faqat questions ichidagi image_url’larni to‘liq URLga aylantiramiz
    const toFull = (rel) => buildFullUrl(req, rel);
    const formatted = {
      ...attempt,
      questions: (attempt?.questions || []).map((q) => ({
        ...q,
        image_url: toFull(q.image_url),
      })),
    };

    res.json({ data: formatted });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/v1/attempts/:attemptId/answer
 */
async function answer(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    const { question_id, option_id } = req.body || {};
    if (!attemptId || !question_id)
      return res.status(400).json({ message: "Invalid payload" });

    const row = await service.answerUpsert({
      attemptId,
      questionId: Number(question_id),
      optionId: option_id ? Number(option_id) : null,
      user: req.user,
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
    if (!attemptId)
      return res.status(400).json({ message: "Invalid attempt id" });
    const updated = await service.finishAttempt({ attemptId, user: req.user });
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/v1/attempts/:attemptId
 */
// async function getOne(req, res, next) {
//   try {
//     const attemptId = Number(req.params.attemptId);
//     if (!attemptId)
//       return res.status(400).json({ message: "Invalid attempt id" });
//     const result = await service.getAttempt({ attemptId, user: req.user });
//     res.json({ data: result });
//   } catch (e) {
//     next(e);
//   }
// }

async function getOne(req, res, next) {
  try {
    const attemptId = Number(req.params.attemptId);
    if (!attemptId) {
      return res.status(400).json({ message: "Invalid attempt id" });
    }
    const result = await service.getAttempt({ attemptId, user: req.user });

    const formatted = formatAttemptResponse(req, result);

    res.json({ data: formatted });
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

// attempts/controller.js
// const service = require("./services");
// const isLoggedIn = require("../../shared/auth/_isLoggedIn");

// /** Robust URL joiner: http/https bo‘lsa o‘zgartirmaymiz, aks holda host bilan birlashtiramiz */
// function buildFullUrl(req, rel) {
//   if (!rel) return null;
//   if (/^https?:\/\//i.test(rel)) return rel; // allaqachon absolute
//   const base = `${req.protocol}://${req.get("host")}`.replace(/\/+$/, "");
//   const path = String(rel).replace(/^\/+/, "");
//   return `${base}/${path}`;
// }

// /** Attempt payload ichida bo‘lishi mumkin bo‘lgan image_url maydonlarini normalize qiladi */
// function normalizeAttemptPayloadUrls(req, payload) {
//   if (!payload) return payload;

//   // shallow clone
//   const out = { ...payload };

//   // root-level (kamdan-kam hollarda bo‘lishi mumkin)
//   if (out.image_url) {
//     out.image_url = buildFullUrl(req, out.image_url);
//   }

//   // test image_url bo‘lsa
//   if (out.test && out.test.image_url) {
//     out.test = {
//       ...out.test,
//       image_url: buildFullUrl(req, out.test.image_url),
//     };
//   }

//   // questions[] ichidagi image_url lar
//   if (Array.isArray(out.questions)) {
//     out.questions = out.questions.map((q) => ({
//       ...q,
//       image_url: q?.image_url
//         ? buildFullUrl(req, q.image_url)
//         : q?.image_url ?? null,
//     }));
//   }

//   return out;
// }

// /**
//  * POST /api/v1/attempts/tests/:id/start
//  */
// async function start(req, res, next) {
//   try {
//     const testId = Number(req.params.id);
//     if (!testId) return res.status(400).json({ message: "Invalid test id" });
//     const studentId = req.user?.id;
//     if (!studentId) return res.status(401).json({ message: "Unauthorized" });

//     const attempt = await service.startAttempt({ studentId, testId });

//     // ⬇️ URL’larni to‘liq qilamiz
//     const data = normalizeAttemptPayloadUrls(req, attempt);

//     res.json({ data });
//   } catch (e) {
//     next(e);
//   }
// }

// /**
//  * POST /api/v1/attempts/:attemptId/answer
//  */
// async function answer(req, res, next) {
//   try {
//     const attemptId = Number(req.params.attemptId);
//     const { question_id, option_id } = req.body || {};
//     if (!attemptId || !question_id)
//       return res.status(400).json({ message: "Invalid payload" });

//     const row = await service.answerUpsert({
//       attemptId,
//       questionId: Number(question_id),
//       optionId: option_id ? Number(option_id) : null,
//       user: req.user,
//     });

//     res.json({ data: row }); // bunda image_url yo‘q, o‘zgartirish shart emas
//   } catch (e) {
//     next(e);
//   }
// }

// /**
//  * POST /api/v1/attempts/:attemptId/finish
//  */
// async function finish(req, res, next) {
//   try {
//     const attemptId = Number(req.params.attemptId);
//     if (!attemptId)
//       return res.status(400).json({ message: "Invalid attempt id" });
//     const updated = await service.finishAttempt({ attemptId, user: req.user });

//     res.json({ data: updated }); // bunda ham image_url yo‘q
//   } catch (e) {
//     next(e);
//   }
// }

// /**
//  * GET /api/v1/attempts/:attemptId
//  */
// async function getOne(req, res, next) {
//   try {
//     const attemptId = Number(req.params.attemptId);
//     if (!attemptId)
//       return res.status(400).json({ message: "Invalid attempt id" });

//     const result = await service.getAttempt({ attemptId, user: req.user });

//     // ⬇️ URL’larni to‘liq absolute ko‘rinishga keltiramiz
//     const data = normalizeAttemptPayloadUrls(req, result);

//     res.json({ data });
//   } catch (e) {
//     next(e);
//   }
// }

// module.exports = {
//   start,
//   answer,
//   finish,
//   getOne,
//   isLoggedIn,
// };
