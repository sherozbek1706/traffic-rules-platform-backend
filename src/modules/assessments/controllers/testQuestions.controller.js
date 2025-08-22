const resp = require("../../../shared/response");
const service = require("../services/testQuestions.service");

module.exports.add = async (req, res, next) => {
  try {
    const { test_id, question_id, order } = req.body;
    if (!test_id || !question_id) return resp.fail(res, 400, "test_id and question_id are required");
    const row = await service.add({ test_id, question_id, order });
    return resp.created(res, row, "Attached");
  } catch (err) { next(err); }
};

module.exports.bulkAdd = async (req, res, next) => {
  try {
    const { test_id, question_ids } = req.body;
    if (!test_id || !Array.isArray(question_ids) || question_ids.length === 0) {
      return resp.fail(res, 400, "test_id and question_ids[] are required");
    }
    const rows = await service.bulkAdd({ test_id, question_ids });
    return resp.ok(res, rows);
  } catch (err) { next(err); }
};

module.exports.list = async (req, res, next) => {
  try {
    const test_id = Number(req.query.test_id);
    if (!test_id) return resp.fail(res, 400, "test_id is required");
    const rows = await service.listByTest(test_id);
    return resp.ok(res, rows);
  } catch (err) { next(err); }
};

module.exports.edit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await service.update(id, { order: req.body.order });
    if (!row) return resp.fail(res, 404, "Not found");
    return resp.ok(res, row);
  } catch (err) { next(err); }
};

module.exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.remove(id);
    if (!ok) return resp.fail(res, 404, "Not found");
    return resp.ok(res, { removed: true });
  } catch (err) { next(err); }
};
