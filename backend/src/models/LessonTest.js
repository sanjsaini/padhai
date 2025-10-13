const mongoose = require("mongoose");

const lessonTestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    section: { 
      type: String, 
      required: true, 
      enum: ["vocabulary", "grammar", "punctuation", "reading"] 
    },
    level: { 
      type: String, 
      required: true, 
      enum: ["easy", "medium", "advanced"] 
    },
    testNumber: { type: Number, required: true },
    testTitle: { type: String, required: true },
    content: { type: mongoose.Mixed, required: true }, // Store the full test content
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    score: { type: Number, default: 0 }, // 0-100 percentage
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    answers: { type: mongoose.Mixed }, // User's answers
    questionResults: { type: mongoose.Mixed }, // Detailed results for each question
    timeSpent: { type: Number, default: 0 }, // in minutes
    passingScore: { type: Number, default: 70 },
    passed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
lessonTestSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonTestSchema.index({ userId: 1, section: 1, level: 1, testNumber: 1 });

module.exports = mongoose.model("LessonTest", lessonTestSchema);
