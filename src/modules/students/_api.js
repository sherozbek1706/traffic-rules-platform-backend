const router = require("express").Router();
const controller = require("./_controller");
const { mAdmin, mStudent, mAllRoles } = require("../../handler/exports");
const isLoggedIn = require("../../shared/auth/_isLoggedIn");

router.post("/add", mAdmin, controller.add);
router.get("/list", mAdmin, controller.list);
router.delete("/remove/:id", mAdmin, controller.remove);
router.put("/edit", mStudent, controller.editSelf);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", mStudent, controller.profile);
router.put("/edit/:id", mAdmin, controller.edit);

router.get("/:id/stats", mAllRoles, controller.getStudentStats);

module.exports = router;
