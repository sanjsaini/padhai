const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
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
    lessonNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: mongoose.Mixed, required: true }, // Store the full lesson content
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }, // 0-100 percentage
    timeSpent: { type: Number, default: 0 }, // in minutes
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
lessonSchema.index({ userId: 1, section: 1, level: 1, lessonNumber: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", lessonSchema);
