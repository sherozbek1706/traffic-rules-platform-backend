const resp = require("../../../shared/response");
const schema = require("../schema");
const service = require("../services/options.service");

module.exports.add = async (req, res, next) => {
  try {
    const { error, value } = schema.optionOnlySchema.validate(req.body, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d=>[d.context.key, d.message])) });

    value.content = schema.sanitize(value.content);
    value.explanation = value.explanation ? schema.sanitize(value.explanation) : null;

    const opt = await service.createOption(value);
    return resp.created(res, opt, "Option created");
  } catch (err) {
    if (err && err.code === "23505") {
      return resp.fail(res, 400, "Only one correct option allowed per question");
    }
    next(err);
  }
};

module.exports.list = async (req, res, next) => {
  try {
    const { question_id } = req.query;
    const rows = await service.listOptions({ question_id });
    return resp.ok(res, rows);
  } catch (err) { next(err); }
};

module.exports.one = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await service.getOption(id);
    if (!row) return resp.fail(res, 404, "Not found");
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.edit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = {
      content: schema.sanitize(req.body.content),
      is_correct: !!req.body.is_correct,
      explanation: req.body.explanation ? schema.sanitize(req.body.explanation) : null,
    };
    if (!payload.content) return resp.fail(res, 400, "Validation failed", { errors: { content: "required" } });
    const row = await service.updateOption(id, payload);
    if (!row) return resp.fail(res, 404, "Not found");
    return resp.ok(res, row);
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
    const ok = await service.removeOption(id);
    if (!ok) return resp.fail(res, 404, "Not found");
    return resp.ok(res, { removed: true });
  } catch (err) { next(err); }
};
