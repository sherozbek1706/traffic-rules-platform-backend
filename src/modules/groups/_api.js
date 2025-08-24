const router = require("express").Router();
const controller = require("./_controller");
const { mSuperAdmin, mAdmin } = require("../../handler/exports");

router.post("/add", mSuperAdmin, controller.add);
router.get("/list", controller.list);
router.delete("/remove/:id", mAdmin, controller.remove);
router.put("/edit/:id", mAdmin, controller.edit);
module.exports = router;
