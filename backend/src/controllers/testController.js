const User = require("../models/User");
const Question = require("../models/Question");
const { generatePassageFromLLM } = require("../services/llmService");

// Generate User-Specific Test Content
const generateTestContentController = async (req, res) => {
  const { level = "medium" } = req.body;

  try {
    // Check if user already has test content stored
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has test content, return it instead of generating new
    if (
      user.userTestContent &&
      user.userTestContent.readingPassage &&
      user.userTestContent.questions.length > 0
    ) {
      return res.json({
        testContent: user.userTestContent,
        message: "Retrieved existing test content for user",
      });
    }

    // Generate new test content using Gemini
    const prompt = `Generate a complete English placement test for ${level} level students. 

    Create:
    1. A reading passage (200-300 words) about an interesting topic
    2. 10 multiple choice questions based on the passage covering:
       - Vocabulary (3 questions)
       - Reading comprehension (4 questions) 
       - Grammar (2 questions)
       - Punctuation (1 question)

    Return in this JSON format:
    {
      "readingPassage": "Your reading passage here...",
      "questions": [
        {
          "id": "unique_id",
          "questionNumber": 1,
          "question": "Question text here",
          "type": "single_choice | multiple_choice",
          "options": ["option1", "option2", "option3", "option4"],
          "answer": "string for single_choice or array for multiple_choice",
          "category": "vocabulary|reading|grammar|punctuation",
          "explanation": "Why this is correct"
        }
      ]
    }

    Requirements:
    - Reading passage should be engaging and appropriate for ${level} level
    - Each choice question must have exactly 4 options
    - CRITICAL: If there is exactly ONE correct option, use type = "single_choice" and set "answer" to a string.
    - CRITICAL: If there are MULTIPLE correct options, use type = "multiple_choice" and set "answer" to an array of two or more option strings.
    - The correct answer(s) must be included in the 4 options.
    - Questions should test understanding of the passage content
    - Use clear, unambiguous language
    - Generate exactly 10 questions`;

    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL_NAME || "gemini-2.0-flash";

    if (!apiKey) {
      return res.status(500).json({
        message: "LLM API key not configured",
        error: "Missing LLM_API_KEY environment variable",
      });
    }

    const llmResponse = await generatePassageFromLLM({
      apiKey,
      modelName: model,
      prompt,
      maxTokens: 4000,
    });

    const testContentData = JSON.parse(llmResponse);

    // Normalize questions to correct type based on answers
    if (testContentData && Array.isArray(testContentData.questions)) {
      testContentData.questions = testContentData.questions.map((q) => {
        const question = { ...q };
        if (
          question.type === "single_choice" ||
          question.type === "multiple_choice"
        ) {
          const options = Array.isArray(question.options)
            ? [...question.options]
            : [];
          let answersArray;
          if (Array.isArray(question.answer)) {
            answersArray = question.answer.filter((a) => typeof a === "string");
          } else if (typeof question.answer === "string") {
            answersArray = [question.answer];
          } else {
            answersArray = [];
          }

          const distinctAnswers = [...new Set(answersArray)];
          if (distinctAnswers.length <= 1) {
            question.type = "single_choice";
            question.answer = distinctAnswers[0] || options[0] || "";
          } else {
            question.type = "multiple_choice";
            question.answer = distinctAnswers;
          }

          const ensureInOptions = (ans) => {
            if (ans && !options.includes(ans)) options.push(ans);
          };
          if (question.type === "single_choice") {
            ensureInOptions(question.answer);
          } else {
            question.answer.forEach(ensureInOptions);
          }
          question.options = options;
        }
        return question;
      });
    }

    // Store test content for this specific user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { userTestContent: testContentData },
      { new: true }
    );

    res.json({
      testContent: testContentData,
      message: "Generated and stored new test content for user",
    });
  } catch (error) {
    console.error("Generate test content error:", error);
    res.status(500).json({
      message: "Failed to generate test content",
      error: error.message,
    });
  }
};

// Get User-Specific Test Content
const getUserTestContent = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("userTestContent");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      !user.userTestContent ||
      !user.userTestContent.readingPassage ||
      !user.userTestContent.questions.length
    ) {
      return res
        .status(404)
        .json({ message: "No test content found for user" });
    }

    res.json({ testContent: user.userTestContent });
  } catch (error) {
    console.error("Get user test content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Questions Route (fallback to local questions)
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit Placement Test Route
const submitPlacementTest = async (req, res) => {
  const { totalQuestions, correctAnswers, score, answers, questionResults } =
    req.body;

  // debug removed

  try {
    // Determine lesson type based on score
    let lessonType;
    if (score >= 85) {
      lessonType = "advanced";
    } else if (score >= 50) {
      lessonType = "medium";
    } else {
      lessonType = "easy";
    }

    // Prepare placement test results
    const placementTestResults = {
      totalQuestions,
      correctAnswers,
      score,
      answers: answers, // Store answers object
      questionResults: questionResults, // Store question results array
      completedAt: new Date(),
    };

    // Update user with placement test results
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        placementTestCompleted: true,
        lessonType: lessonType,
        placementTestResults: placementTestResults,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // debug removed

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        placementTestCompleted: user.placementTestCompleted,
        lessonType: user.lessonType,
        placementTestResults: user.placementTestResults,
      },
      message: "Placement test results saved successfully",
    });
  } catch (error) {
    console.error("Placement test submission error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Placement Test Status Route
const getPlacementTestStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "placementTestCompleted lessonType placementTestResults"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      placementTestCompleted: user.placementTestCompleted,
      lessonType: user.lessonType,
      placementTestResults: user.placementTestResults,
    });
  } catch (error) {
    console.error("Get placement test status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Test Results Route (for compatibility with earlier code)
const updateTestResults = async (req, res) => {
  const { id } = req.params;
  const { score, correctAnswers, totalQuestions } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { testResults: { score, correctAnswers, totalQuestions } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Update test results error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generateTestContentController,
  getUserTestContent,
  getQuestions,
  submitPlacementTest,
  getPlacementTestStatus,
  updateTestResults,
};
