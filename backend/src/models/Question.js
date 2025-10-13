const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionNumber: Number,
    question: String,
    type: String,
    options: [String],
    answer: mongoose.Mixed,
    selectCount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);
