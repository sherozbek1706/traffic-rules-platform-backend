const resp = require("../../../shared/response");
const schema = require("../schema");
const service = require("../services/recommendations.service");

/** Admin: create */
module.exports.add = async (req, res, next) => {
  try {
    const test_id = Number(req.params.testId);
    if (!test_id) return resp.fail(res, 400, "Invalid test id");
    const { error, value } = schema.recommendationCreateSchema.validate({ ...req.body, test_id }, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d => [d.context?.key, d.message])) });
    const row = await service.create(value);
    return resp.created(res, row, "Recommendation created");
  } catch (err) { next(err); }
};

/** Public/Admin: list by test */
module.exports.listByTest = async (req, res, next) => {
  try {
    const test_id = Number(req.params.testId);
    if (!test_id) return resp.fail(res, 400, "Invalid test id");
    const rows = await service.listByTest(test_id);
    return resp.ok(res, rows);
  } catch (err) { next(err); }
};

/** Admin: update */
module.exports.edit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return resp.fail(res, 400, "Invalid id");
    const { error, value } = schema.recommendationUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) return resp.fail(res, 400, "Validation failed", { errors: Object.fromEntries(error.details.map(d => [d.context?.key, d.message])) });
    const row = await service.update(id, value);
    return resp.ok(res, row, "Updated");
  } catch (err) { next(err); }
};

/** Admin: remove */
module.exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return resp.fail(res, 400, "Invalid id");
    await service.remove(id);
    return resp.ok(res, { id }, "Deleted");
  } catch (err) { next(err); }
};
