const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/auth");

// Generate lessons for user
router.post("/generate", authMiddleware, lessonController.generateUserLessons);

// Generate lessons for specific section
router.post(
  "/generate/:section",
  authMiddleware,
  lessonController.generateSectionLessons
);

// Get user's lessons by section
router.get(
  "/section/:section",
  authMiddleware,
  lessonController.getUserLessons
);

// Get specific lesson
router.get("/:lessonId", authMiddleware, lessonController.getLesson);

// Update lesson progress
router.put(
  "/:lessonId/progress",
  authMiddleware,
  lessonController.updateLessonProgress
);

// Get lesson test
router.get("/:lessonId/test", authMiddleware, lessonController.getLessonTest);

// Submit lesson test
router.post(
  "/test/:testId/submit",
  authMiddleware,
  lessonController.submitLessonTest
);

// Get user's learning progress
router.get(
  "/progress/overview",
  authMiddleware,
  lessonController.getUserProgress
);

module.exports = router;
