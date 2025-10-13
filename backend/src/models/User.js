const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Placement test completion flag
    placementTestCompleted: { type: Boolean, default: false },

    // User's level based on placement test results
    lessonType: {
      type: String,
      enum: ["easy", "medium", "advanced"],
      default: null,
    },

    // User's language preference
    languagePreference: {
      type: String,
      enum: [
        "English",
        "Hindi",
        "Gujarati",
        "Spanish",
        "French",
        "Punjabi",
        "Telugu",
      ],
      default: "English",
    },

    // Placement test results
    placementTestResults: {
      totalQuestions: Number,
      correctAnswers: Number,
      score: Number,
      answers: mongoose.Mixed, // Store user's answers object
      questionResults: [mongoose.Mixed], // Store question results array
      completedAt: { type: Date, default: Date.now },
    },

    // Lesson generation status
    lessonsGenerated: { type: Boolean, default: false },
    lessonsGeneratedAt: { type: Date },

    // Learning progress tracking
    learningProgress: {
      vocabulary: {
        completedLessons: { type: Number, default: 0 },
        completedTests: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        lastAccessed: { type: Date },
      },
      grammar: {
        completedLessons: { type: Number, default: 0 },
        completedTests: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        lastAccessed: { type: Date },
      },
      punctuation: {
        completedLessons: { type: Number, default: 0 },
        completedTests: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        lastAccessed: { type: Date },
      },
      reading: {
        completedLessons: { type: Number, default: 0 },
        completedTests: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        lastAccessed: { type: Date },
      },
    },

    // Overall learning statistics
    totalLessonsCompleted: { type: Number, default: 0 },
    totalTestsCompleted: { type: Number, default: 0 },
    overallAverageScore: { type: Number, default: 0 },
    totalLearningTime: { type: Number, default: 0 }, // in minutes
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
