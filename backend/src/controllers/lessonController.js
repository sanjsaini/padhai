const User = require("../models/User");
const Lesson = require("../models/Lesson");
const LessonTest = require("../models/LessonTest");
const {
  generateCompleteLessonSet,
  generateLessonContent,
  generateLessonTest,
} = require("../services/lessonGenerationService");

// Generate up to 3 lessons for a specific section (idempotent per user/section)
const generateSectionLessons = async (req, res) => {
  try {
    const { section } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.lessonType) {
      return res.status(400).json({
        message:
          "User must complete placement test first to determine lesson level",
      });
    }

    // Check how many lessons already exist for this section
    const existingLessons = await Lesson.find({ userId: user._id, section });
    const existingCount = existingLessons.length;
    const targetCount = 3;
    const remaining = Math.max(0, targetCount - existingCount);

    if (remaining === 0) {
      return res.json({
        message: `Lessons for ${section} already generated`,
        lessonsGenerated: true,
        section,
        level: user.lessonType,
        totalLessons: existingCount,
      });
    }

    

    // Generate remaining lessons (up to targetCount total)
    const {
      generateLessonContent,
      generateLessonTest,
    } = require("../services/lessonGenerationService");

    const generated = [];
    for (let i = existingCount + 1; i <= targetCount; i++) {
      const lessonContent = await generateLessonContent(
        section,
        user.lessonType,
        i
      );
      const testContent = await generateLessonTest(lessonContent, i);

      const lesson = new Lesson({
        userId: user._id,
        section,
        level: user.lessonType,
        lessonNumber: i,
        title: lessonContent.title,
        content: lessonContent,
      });
      const savedLesson = await lesson.save();

      const lessonTest = new LessonTest({
        userId: String(user._id),
        lessonId: savedLesson._id,
        section,
        level: user.lessonType,
        testNumber: i,
        testTitle:
          testContent.testTitle || `Test ${i} - ${lessonContent.title}`,
        content: testContent,
        totalQuestions: Array.isArray(testContent.questions)
          ? testContent.questions.length
          : 0,
        passingScore:
          typeof testContent.passingScore === "number"
            ? testContent.passingScore
            : 70,
      });
      const savedTest = await lessonTest.save();

      generated.push({ lesson: savedLesson, test: savedTest });
    }

    res.status(201).json({
      message: `${section} lessons generated successfully`,
      generatedCount: generated.length,
      totalLessons: existingCount + generated.length,
      section,
      level: user.lessonType,
    });
  } catch (error) {
    console.error(`❌ Error generating ${req.params.section} lessons:`, error);
    res.status(500).json({
      message: `Failed to generate ${req.params.section} lessons`,
      error: error.message,
    });
  }
};

// Generate lessons for a user based on their level
const generateUserLessons = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.lessonType) {
      return res.status(400).json({
        message:
          "User must complete placement test first to determine lesson level",
      });
    }

    if (user.lessonsGenerated) {
      return res.json({
        message: "Lessons already generated for this user",
        lessonsGenerated: true,
        level: user.lessonType,
      });
    }

    

    // Generate complete lesson set
    
    const startTime = Date.now();

    const lessonSet = await generateCompleteLessonSet(
      user.lessonType,
      user._id
    );

    const generationTime = Date.now() - startTime;
    

    // Save lessons to database
    const savedLessons = [];
    const savedTests = [];

    for (const [section, sectionData] of Object.entries(lessonSet.sections)) {
      // Save lessons
      for (const lessonContent of sectionData.lessons) {
        const lesson = new Lesson({
          userId: user._id,
          section: lessonContent.section,
          level: lessonContent.level,
          lessonNumber: lessonContent.lessonNumber,
          title: lessonContent.title,
          content: lessonContent,
        });
        await lesson.save();
        savedLessons.push(lesson);
      }

      // Save tests
      for (const testContent of sectionData.tests) {
        // Find the corresponding lesson
        const correspondingLesson = savedLessons.find(
          (l) =>
            l.section === testContent.section &&
            l.lessonNumber === testContent.testNumber
        );

        if (correspondingLesson) {
          const lessonTest = new LessonTest({
            userId: user._id,
            lessonId: correspondingLesson._id,
            section: testContent.section,
            level: testContent.level,
            testNumber: testContent.testNumber,
            testTitle: testContent.testTitle,
            content: testContent,
            passingScore: testContent.passingScore || 70,
          });
          await lessonTest.save();
          savedTests.push(lessonTest);
        }
      }
    }

    // Update user with lesson generation status
    await User.findByIdAndUpdate(user._id, {
      lessonsGenerated: true,
      lessonsGeneratedAt: new Date(),
    });

    

    res.json({
      message: "Lessons generated successfully",
      level: user.lessonType,
      lessonsCount: savedLessons.length,
      testsCount: savedTests.length,
      sections: Object.keys(lessonSet.sections),
    });
  } catch (error) {
    console.error("❌ Error generating lessons:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      message: "Failed to generate lessons",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get user's lessons by section
const getUserLessons = async (req, res) => {
  try {
    const { section } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow fetching even if global flag not set; per-section generation supported now

    const lessons = await Lesson.find({
      userId: req.userId,
      section: section,
    }).sort({ lessonNumber: 1 });

    res.json({
      section: section,
      level: user.lessonType,
      lessons: lessons.map((lesson) => ({
        id: lesson._id,
        title: lesson.title,
        lessonNumber: lesson.lessonNumber,
        isCompleted: lesson.isCompleted,
        progress: lesson.progress,
        timeSpent: lesson.timeSpent,
        content: lesson.content,
      })),
    });
  } catch (error) {
    console.error("Error getting user lessons:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific lesson
const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      userId: req.userId,
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Update last accessed time
    await User.findByIdAndUpdate(req.userId, {
      [`learningProgress.${lesson.section}.lastAccessed`]: new Date(),
    });

    res.json({
      lesson: {
        id: lesson._id,
        title: lesson.title,
        section: lesson.section,
        level: lesson.level,
        lessonNumber: lesson.lessonNumber,
        content: lesson.content,
        isCompleted: lesson.isCompleted,
        progress: lesson.progress,
        timeSpent: lesson.timeSpent,
      },
    });
  } catch (error) {
    console.error("Error getting lesson:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update lesson progress
const updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { progress, timeSpent, isCompleted } = req.body;

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, userId: req.userId },
      {
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
      },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Update user's learning progress
    if (isCompleted) {
      await User.findByIdAndUpdate(req.userId, {
        $inc: {
          [`learningProgress.${lesson.section}.completedLessons`]: 1,
          totalLessonsCompleted: 1,
          totalLearningTime: timeSpent || 0,
        },
        [`learningProgress.${lesson.section}.lastAccessed`]: new Date(),
      });
    }

    res.json({
      message: "Lesson progress updated successfully",
      lesson: {
        id: lesson._id,
        progress: lesson.progress,
        isCompleted: lesson.isCompleted,
        timeSpent: lesson.timeSpent,
      },
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get lesson test
const getLessonTest = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // First check if the lesson exists and is completed
    const lesson = await Lesson.findOne({
      _id: lessonId,
      userId: req.userId,
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (lesson.progress < 50) {
      return res.status(403).json({
        message:
          "You must mark the lesson as complete (50%) before taking the test",
      });
    }

    const test = await LessonTest.findOne({
      lessonId: lessonId,
      userId: req.userId,
    });

    if (!test) {
      return res
        .status(404)
        .json({ message: "Test not found for this lesson" });
    }

    res.json({
      test: {
        id: test._id,
        testTitle: test.testTitle,
        section: test.section,
        level: test.level,
        testNumber: test.testNumber,
        content: test.content,
        isCompleted: test.isCompleted,
        score: test.score,
        correctAnswers: test.correctAnswers,
        totalQuestions: test.totalQuestions,
        questionResults: test.questionResults,
        passingScore: test.passingScore,
        timeSpent: test.timeSpent,
        passed: test.passed,
      },
    });
  } catch (error) {
    console.error("Error getting lesson test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit lesson test
const submitLessonTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, timeSpent } = req.body;

    const test = await LessonTest.findOne({
      _id: testId,
      userId: req.userId,
    });

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.isCompleted) {
      return res.status(400).json({ message: "Test already completed" });
    }

    // Calculate score
    const questions = test.content.questions;
    let correctAnswers = 0;
    const questionResults = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      // Normalize answers for comparison (trim whitespace and convert to lowercase)
      const normalizeAnswer = (answer) => {
        if (Array.isArray(answer)) {
          return answer.map((item) => String(item).trim().toLowerCase());
        }
        return String(answer).trim().toLowerCase();
      };

      let normalizedUserAnswer = normalizeAnswer(userAnswer);
      let normalizedCorrectAnswer = normalizeAnswer(question.correctAnswer);

      // Harmonize types: allow single-answer questions to be answered with an array of length 1
      const removeEmpty = (arr) =>
        arr.filter((item) => String(item).trim().length > 0);

      if (
        Array.isArray(normalizedUserAnswer) &&
        !Array.isArray(normalizedCorrectAnswer)
      ) {
        // Reduce to a single value if only one provided
        const compact = removeEmpty(normalizedUserAnswer);
        normalizedUserAnswer = compact.length === 1 ? compact[0] : compact;
      }

      if (
        !Array.isArray(normalizedUserAnswer) &&
        Array.isArray(normalizedCorrectAnswer)
      ) {
        const compact = removeEmpty(normalizedCorrectAnswer);
        normalizedCorrectAnswer = compact.length === 1 ? compact[0] : compact;
      }

      // Handle different answer types
      if (
        Array.isArray(normalizedUserAnswer) &&
        Array.isArray(normalizedCorrectAnswer)
      ) {
        // For array answers (matching, multiple choice), compare arrays (order-insensitive)
        const left = removeEmpty(normalizedUserAnswer).sort();
        const right = removeEmpty(normalizedCorrectAnswer).sort();
        isCorrect = JSON.stringify(left) === JSON.stringify(right);
      } else {
        // For single answers, direct comparison
        isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      }

      // Debug logging
      console.log(`Question ${index + 1}:`, {
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        normalizedUserAnswer: normalizedUserAnswer,
        normalizedCorrectAnswer: normalizedCorrectAnswer,
        isCorrect: isCorrect,
      });

      if (isCorrect) correctAnswers++;

      questionResults.push({
        questionNumber: question.questionNumber,
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation,
      });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= test.passingScore;

    // Update test with results
    const updatedTest = await LessonTest.findByIdAndUpdate(
      testId,
      {
        isCompleted: true,
        completedAt: new Date(),
        score: score,
        totalQuestions: questions.length,
        correctAnswers: correctAnswers,
        answers: answers,
        questionResults: questionResults,
        timeSpent: timeSpent || 0,
        passed: passed,
      },
      { new: true }
    );

    // Update the lesson to 100% completion
    await Lesson.findByIdAndUpdate(test.lessonId, {
      progress: 100,
      isCompleted: true,
      completedAt: new Date(),
    });

    // Update user's learning progress
    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        [`learningProgress.${test.section}.completedTests`]: 1,
        [`learningProgress.${test.section}.completedLessons`]: 1,
        totalTestsCompleted: 1,
        totalLessonsCompleted: 1,
        totalLearningTime: timeSpent || 0,
      },
      $set: {
        [`learningProgress.${test.section}.lastAccessed`]: new Date(),
      },
    });

    // Calculate new average score for the section
    const user = await User.findById(req.userId);
    const sectionProgress = user.learningProgress[test.section];
    const newAverageScore =
      sectionProgress.completedTests > 0
        ? Math.round(
            (sectionProgress.averageScore *
              (sectionProgress.completedTests - 1) +
              score) /
              sectionProgress.completedTests
          )
        : score;

    await User.findByIdAndUpdate(req.userId, {
      [`learningProgress.${test.section}.averageScore`]: newAverageScore,
    });

    res.json({
      message: "Test submitted successfully",
      test: {
        id: updatedTest._id,
        score: updatedTest.score,
        passed: updatedTest.passed,
        correctAnswers: updatedTest.correctAnswers,
        totalQuestions: updatedTest.totalQuestions,
        questionResults: updatedTest.questionResults,
      },
    });
  } catch (error) {
    console.error("Error submitting lesson test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's learning progress
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      level: user.lessonType,
      lessonsGenerated: user.lessonsGenerated,
      learningProgress: user.learningProgress,
      totalLessonsCompleted: user.totalLessonsCompleted,
      totalTestsCompleted: user.totalTestsCompleted,
      overallAverageScore: user.overallAverageScore,
      totalLearningTime: user.totalLearningTime,
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generateSectionLessons,
  generateUserLessons,
  getUserLessons,
  getLesson,
  updateLessonProgress,
  getLessonTest,
  submitLessonTest,
  getUserProgress,
};
