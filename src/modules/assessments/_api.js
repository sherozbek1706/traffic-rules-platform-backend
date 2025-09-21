const router = require("express").Router();
const isLoggedIn = require("../../shared/auth/_isLoggedIn");
const upload = require("../../middleware/upload");
const { makeUploader, uploadOptions } = require("../../middleware/upload");

const Tests = require("./controllers/tests.controller");
const Questions = require("./controllers/questions.controller");
const Options = require("./controllers/options.controller");
const TQ = require("./controllers/testQuestions.controller");
const Recommendations = require("./controllers/recommendations.controller");

// All endpoints below require admin login
router.get("/tests/:testId/recommendations", Recommendations.listByTest);

router.use(isLoggedIn);
router.post("/tests/:testId/recommendations", Recommendations.add);
router.put("/tests/:testId/recommendations/:id", Recommendations.edit);
router.delete("/tests/:testId/recommendations/:id", Recommendations.remove);

// Tests
router.post("/tests/add", Tests.add);
router.get("/tests/list", Tests.list);
router.get("/tests/one/:id", Tests.one);
router.put("/tests/edit/:id", Tests.edit);
router.patch("/tests/publish/:id", Tests.publish);
router.patch("/tests/unpublish/:id", Tests.unpublish);
router.delete("/tests/remove/:id", Tests.remove);

// Questions (with optional image upload via multipart or via image_url field)
router.post("/questions/add", upload.single("image"), Questions.add);
router.get("/questions/list", Questions.list);
router.get("/questions/one/:id", Questions.one);
router.put("/questions/edit/:id", upload.single("image"), Questions.edit);
router.delete("/questions/remove/:id", Questions.remove);

// Options CRUD
router.post("/options/add", Options.add);
router.get("/options/list", Options.list);
router.get("/options/one/:id", Options.one);
router.put("/options/edit/:id", Options.edit);
router.delete("/options/remove/:id", Options.remove);

// Test-Questions
router.post("/test-questions/add", TQ.add);
router.post("/test-questions/bulk-add", TQ.bulkAdd);
router.get("/test-questions/list", TQ.list);
router.put("/test-questions/edit/:id", TQ.edit);
router.delete("/test-questions/remove/:id", TQ.remove);

// Upload endpoints (return stable URL) - optional convenience
const upQ = makeUploader("questions");
router.post("/uploads/question-image", upQ.single("image"), (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  return res.json({
    success: true,
    url: `/uploads/questions/${req.file.filename}`,
  });
});

router.post(
  "/uploads/option-image",
  uploadOptions.single("image"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    return res.json({
      success: true,
      url: `/uploads/options/${req.file.filename}`,
    });
  }
);

module.exports = router;
