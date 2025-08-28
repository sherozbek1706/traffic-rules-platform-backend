module.exports = {
  ok(res, data = null, message = "OK") {
    return res.json({ success: true, message, data });
  },
  created(res, data = null, message = "Created") {
    return res.status(201).json({ success: true, message, data });
  },
  fail(res, status = 400, message = "Bad Request", details = null) {
    return res.status(status).json({ success: false, message, details });
  },
};
