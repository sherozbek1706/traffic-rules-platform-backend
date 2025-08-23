
const express = require("express");
const api = express.Router();
const ctrl = require("./controller");

api.post("/tests/:id/start", ctrl.isLoggedIn, ctrl.start);

// attempts
api.post("/attempts/:attemptId/answer", ctrl.isLoggedIn, ctrl.answer);
api.post("/attempts/:attemptId/finish", ctrl.isLoggedIn, ctrl.finish);
api.get("/attempts/:attemptId", ctrl.isLoggedIn, ctrl.getOne);

module.exports = api;
