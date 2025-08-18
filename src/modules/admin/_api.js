const router = require("express").Router();
const controller = require("./_controller");
const { mSuperAdmin, mAdmin } = require("../../handler/exports");

// router.post("/", mSuperAdmin, controller.add);
router.post("/add", mSuperAdmin, controller.add);
router.post("/login", controller.login);
router.get("/list", mAdmin, controller.list);
router.delete("/remove/:id", mAdmin, controller.remove);
router.put("/edit/:id", mAdmin, controller.edit);
router.get("/profile", mAdmin, controller.profile);
router.post("/add-admin-to-group", mSuperAdmin, controller.addAdminToGroup);
router.get("/list-group-admins", mSuperAdmin, controller.listGroupAdmins);
router.get("/my-group", mAdmin, controller.myGroup);
router.delete(
  "/remove-admin-groups/:id",
  mSuperAdmin,
  controller.removeAdminGroups
);

module.exports = router;
