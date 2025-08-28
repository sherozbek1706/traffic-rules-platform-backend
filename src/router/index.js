const router = require("express").Router();

const adminRouterApi = require("../modules/admin/_api");
const groupsRouterApi = require("../modules/groups/_api");
const studentsRouterApi = require("../modules/students/_api");
const assessmentsApi = require("../modules/assessments/_api");
const attemptsApi = require("../modules/attempts/_api");

router.use("/admin", adminRouterApi);
router.use("/groups", groupsRouterApi);
router.use("/students", studentsRouterApi);
router.use("/assessments", assessmentsApi);
// Attempts + start endpoint
router.use("/attempts", attemptsApi);

module.exports = router;
