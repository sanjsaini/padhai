const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/auth");

// Protected routes
router.post(
  "/test-content/generate",
  authMiddleware,
  testController.generateTestContentController
);
router.get(
  "/test-content/user",
  authMiddleware,
  testController.getUserTestContent
);
router.get("/questions", authMiddleware, testController.getQuestions);
router.post(
  "/placement-test/submit",
  authMiddleware,
  testController.submitPlacementTest
);
router.get(
  "/placement-test/status",
  authMiddleware,
  testController.getPlacementTestStatus
);
router.put(
  "/users/:id/test-results",
  authMiddleware,
  testController.updateTestResults
);

module.exports = router;
