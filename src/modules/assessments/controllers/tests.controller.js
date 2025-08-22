const resp = require("../../../shared/response");
const service = require("../services/tests.service");
const schema = require("../schema");

module.exports.add = async (req, res, next) => {
  try {
    const { error, value } = schema.testCreateSchema.validate(req.body, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d=>[d.context.key, d.message])) });
    const test = await service.createTest(value);
    return resp.created(res, test, "Test created");
  } catch (err) { next(err); }
};

module.exports.list = async (req, res, next) => {
  try {
    const rows = await service.listTests();
    return resp.ok(res, rows);
  } catch (err) { next(err); }
};

module.exports.one = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await service.getTest(id);
    if (!row) return resp.fail(res, 404, "Not found");
    // fix full URLs in nested images
    row.questions = row.questions.map(q => ({ ...q, image_url: q.image_url ? (req.protocol + "://" + req.get("host") + q.image_url) : null }));
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.edit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { error, value } = schema.testUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d=>[d.context.key, d.message])) });
    const row = await service.updateTest(id, value);
    if (!row) return resp.fail(res, 404, "Not found");
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.publish = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    try {
      const row = await service.setPublish(id, true);
      if (!row) return resp.fail(res, 404, "Not found");
      return resp.ok(res, row);
    } catch (e) {
      if (e && e.code === "NO_QUESTIONS") {
        return resp.fail(res, 400, "Cannot publish: test has no linked questions.");
      }
      throw e;
    }
  } catch (err) { next(err); }
};

module.exports.unpublish = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await service.setPublish(id, false);
    if (!row) return resp.fail(res, 404, "Not found");
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.removeTest(id);
    if (!ok) return resp.fail(res, 404, "Not found");
    return resp.ok(res, { removed: true });
  } catch (err) { next(err); }
};
