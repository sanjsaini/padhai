const mongoose = require("mongoose");

const LessonContentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    skill: { type: String },
    lessonName: { type: String },
    passage: { type: String, required: true },
    meta: { type: Object }, // store prompt or other metadata
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LessonContentSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("LessonContent", LessonContentSchema);
