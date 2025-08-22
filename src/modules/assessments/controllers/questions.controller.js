const resp = require("../../../shared/response");
const service = require("../services/questions.service");
const schema = require("../schema");

function buildFullUrl(req, rel) {
  if (!rel) return null;
  const base = req.protocol + "://" + req.get("host");
  return rel.startsWith("http") ? rel : (base + rel);
}

function oneCorrect(options) {
  return options.filter(o => !!o.is_correct).length === 1;
}

module.exports.add = async (req, res, next) => {
  try {
    // JSON or Multipart (image optional)
    const body = req.body || {};
    const rawOptions = body.options ? (typeof body.options === "string" ? JSON.parse(body.options) : body.options) : [];
    const toValidate = { content: body.content, admin_id: body.admin_id ? Number(body.admin_id) : undefined, options: rawOptions };
    const { error, value } = schema.questionCreateSchema.validate(toValidate, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d=>[d.context.key, d.message])) });
    if (!oneCorrect(value.options)) return resp.fail(res, 400, "Validation failed", { errors: { options: "Exactly one option must be is_correct=true" } });

    // sanitize HTML fields
    value.content = schema.sanitize(value.content);
    value.options = value.options.map(o=>({ ...o, content: schema.sanitize(o.content), explanation: o.explanation ? schema.sanitize(o.explanation) : null }));

    const imageRel = req.file ? `/public/uploads/questions/${req.file.filename}` : (body.image_url || null);
    const q = await service.createQuestionWithOptions({ content: value.content, admin_id: value.admin_id, image_url: imageRel, options: value.options });
    const qFull = await service.getQuestionWithOptions(q.id);
    qFull.image_url = buildFullUrl(req, qFull.image_url);
    return resp.created(res, qFull, "Question created");
  } catch (err) {
    if (err && err.code === "23505") {
      return resp.fail(res, 400, "Only one correct option allowed per question");
    }
    next(err);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const with_options = String(req.query.with_options || "false") === "true";
    const rows = await service.listQuestions({ with_options });
    const mapped = rows.map(q=>({ ...q, image_url: buildFullUrl(req, q.image_url) }));
    return resp.ok(res, mapped);
  } catch (err) { next(err); }
};

module.exports.one = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await service.getQuestionWithOptions(id);
    if (!row) return resp.fail(res, 404, "Not found");
    row.image_url = buildFullUrl(req, row.image_url);
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.edit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const rawOptions = body.options ? (typeof body.options === "string" ? JSON.parse(body.options) : body.options) : [];
    const toValidate = { content: body.content, options: rawOptions };
    const { error, value } = schema.questionUpdateSchema.validate(toValidate, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d=>[d.context.key, d.message])) });
    if (!oneCorrect(value.options)) return resp.fail(res, 400, "Validation failed", { errors: { options: "Exactly one option must be is_correct=true" } });

    value.content = schema.sanitize(value.content);
    value.options = value.options.map(o=>({ ...o, content: schema.sanitize(o.content), explanation: o.explanation ? schema.sanitize(o.explanation) : null }));

    const imageRel = req.file ? `/public/uploads/questions/${req.file.filename}` : (body.image_url ?? undefined);
    const updated = await service.updateQuestionWithUpsert(id, { content: value.content, image_url: imageRel, options: value.options });
    if (!updated) return resp.fail(res, 404, "Not found");
    updated.image_url = buildFullUrl(req, updated.image_url);
    return resp.ok(res, updated);
  } catch (err) {
    if (err && err.code === "23505") {
      return resp.fail(res, 400, "Only one correct option allowed per question");
    }
    next(err);
  }
};

module.exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.removeQuestion(id);
    if (!ok) return resp.fail(res, 404, "Not found");
    return resp.ok(res, { removed: true });
  } catch (err) { next(err); }
};
