import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonsPage.css";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const LessonsPage = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [showLessonReading, setShowLessonReading] = useState(false);
  const [showLessonTest, setShowLessonTest] = useState(false);
  const [practiceExerciseResults, setPracticeExerciseResults] = useState(null);

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserLessons(section);

      setLessons(data.lessons || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
      setError("Failed to load lessons. Please try again.");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (!user.placementTestCompleted) {
      navigate("/placement-test");
      return;
    }

    loadLessons();
  }, [section, user, navigate, loadLessons]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    setShowLessonReading(true);
  };

  const handleStartTest = async () => {
    try {
      setTestLoading(true);
      setError(null);

      // Check if lesson progress is at least 50%
      if (currentLesson.progress < 50) {
        setError(
          "You must mark the lesson as complete (50%) before taking the test."
        );
        return;
      }

      // Fetch the test for this lesson
      const testData = await api.getLessonTest(currentLesson.id);

      setCurrentTest(testData.test);
      setShowLessonReading(false);
      setShowLessonTest(true);
    } catch (error) {
      console.error("Error loading test:", error);
      if (error.response?.status === 403) {
        setError(
          error.response.data.message ||
            "You must complete the lesson before taking the test."
        );
      } else {
        setError("Failed to load test. Please try again.");
      }
    } finally {
      setTestLoading(false);
    }
  };

  const handleBackFromReading = () => {
    setShowLessonReading(false);
    setCurrentLesson(null);
    setError(null);
    setPracticeExerciseResults(null);
  };

  const checkPracticeExercises = () => {
    if (!currentLesson.content.exercises) return;

    const results = [];
    let correctCount = 0;

    currentLesson.content.exercises.forEach((exercise, index) => {
      let userAnswer = "";
      let isCorrect = false;

      // Get user's answer based on exercise type
      if (exercise.type === "matching") {
        const selects = document.querySelectorAll(
          `select[name^="exercise-matching-${index}"]`
        );
        const matchingAnswers = [];
        selects.forEach((select) => {
          matchingAnswers.push(select.value);
        });
        userAnswer = matchingAnswers;

        // For matching exercises, we need to compare the selected meanings
        // with the correct meanings from the pairs
        if (exercise.pairs && Array.isArray(exercise.pairs)) {
          // Extract correct meanings from pairs
          const correctMeanings = exercise.pairs.map((pair) => {
            if (pair.meaning) return pair.meaning;
            if (pair.definition) return pair.definition;
            return "Unknown meaning";
          });

          // Compare user selections with correct meanings
          // Normalize both arrays for comparison
          const normalizedUserAnswers = matchingAnswers
            .map((answer) => String(answer).trim().toLowerCase())
            .sort();
          const normalizedCorrectAnswers = correctMeanings
            .map((answer) => String(answer).trim().toLowerCase())
            .sort();

          isCorrect =
            JSON.stringify(normalizedUserAnswers) ===
            JSON.stringify(normalizedCorrectAnswers);
        } else if (Array.isArray(exercise.correctAnswer)) {
          // Fallback to original logic if pairs not available
          isCorrect =
            JSON.stringify(userAnswer.sort()) ===
            JSON.stringify(exercise.correctAnswer.sort());
        } else {
          isCorrect = userAnswer.join(", ") === exercise.correctAnswer;
        }
      } else if (exercise.type === "multiple_choice") {
        const checkboxes = document.querySelectorAll(
          `input[name="exercise-${index}"]:checked`
        );
        const multipleAnswers = [];
        checkboxes.forEach((checkbox) => {
          multipleAnswers.push(checkbox.value);
        });
        userAnswer = multipleAnswers;

        if (Array.isArray(exercise.correctAnswer)) {
          isCorrect =
            JSON.stringify(userAnswer.sort()) ===
            JSON.stringify(exercise.correctAnswer.sort());
        } else {
          isCorrect = userAnswer.includes(exercise.correctAnswer);
        }
      } else {
        // Single choice, fill_blank, etc.
        const input =
          document.querySelector(`input[name="exercise-${index}"]:checked`) ||
          document.querySelector(`input[name="exercise-${index}"]`);

        userAnswer = input ? input.value : "";

        // Normalize for comparison
        const normalizedUserAnswer = String(userAnswer).trim().toLowerCase();
        const normalizedCorrectAnswer = String(exercise.correctAnswer)
          .trim()
          .toLowerCase();
        isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      }

      if (isCorrect) correctCount++;

      // For matching exercises, show the correct meanings from pairs
      let displayCorrectAnswer = exercise.correctAnswer;
      if (
        exercise.type === "matching" &&
        exercise.pairs &&
        Array.isArray(exercise.pairs)
      ) {
        const correctMeanings = exercise.pairs.map((pair) => {
          if (pair.meaning) return pair.meaning;
          if (pair.definition) return pair.definition;
          return "Unknown meaning";
        });
        displayCorrectAnswer = correctMeanings;
      }

      results.push({
        exerciseNumber: index + 1,
        question: exercise.question,
        userAnswer: userAnswer,
        correctAnswer: displayCorrectAnswer,
        isCorrect: isCorrect,
        explanation: exercise.explanation,
        type: exercise.type,
      });
    });

    setPracticeExerciseResults({
      results: results,
      correctCount: correctCount,
      totalCount: results.length,
      score: Math.round((correctCount / results.length) * 100),
    });
  };

  const handleMarkLessonComplete = async () => {
    try {
      await api.updateLessonProgress(currentLesson.id, {
        progress: 50,
        isCompleted: false, // Keep as false until test is completed
        timeSpent: 5, // Mock time spent
      });

      // Update the current lesson state
      setCurrentLesson((prev) => ({
        ...prev,
        progress: 50,
      }));

      // Refresh lessons list
      await loadLessons();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      setError("Failed to mark lesson as complete.");
    }
  };

  const handleBackFromTest = () => {
    setShowLessonTest(false);
    setCurrentTest(null);
    setShowLessonReading(true);
  };

  const handleTestComplete = async (testResults) => {
    try {
      // Submit test results first
      const testResponse = await api.submitLessonTest(currentTest.id, {
        answers: testResults.answers,
        timeSpent: testResults.timeSpent || 0,
      });

      // Update lesson progress to 100% and mark as completed
      await api.updateLessonProgress(currentLesson.id, {
        progress: 100,
        isCompleted: true,
        timeSpent: testResults.timeSpent || 0,
      });

      // Update the current lesson state
      setCurrentLesson((prev) => ({
        ...prev,
        progress: 100,
        isCompleted: true,
      }));

      // Update the current test state with results
      setCurrentTest((prev) => ({
        ...prev,
        isCompleted: true,
        score: testResponse.test.score,
        correctAnswers: testResponse.test.correctAnswers,
        totalQuestions: testResponse.test.totalQuestions,
        questionResults: testResponse.test.questionResults,
        passed: testResponse.test.passed,
      }));

      // Refresh lessons list
      await loadLessons();
    } catch (error) {
      console.error("Error completing test:", error);
      setError("Failed to submit test. Please try again.");
    }
  };

  const getSectionTitle = () => {
    const titles = {
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      punctuation: "Punctuation",
      reading: "Reading",
    };
    return titles[section] || section;
  };

  const renderExerciseInput = (exercise, index) => {
    switch (exercise.type) {
      case "single_choice":
        return (
          <div className="options-container">
            {exercise.options.map((option, optIndex) => (
              <label key={optIndex} className="radio-option">
                <input type="radio" name={`exercise-${index}`} value={option} />
                <span className="radio-custom"></span>
                {option}
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="options-container">
            {exercise.options.map((option, optIndex) => (
              <label key={optIndex} className="checkbox-option">
                <input
                  type="checkbox"
                  name={`exercise-${index}`}
                  value={option}
                />
                <span className="checkbox-custom"></span>
                {option}
              </label>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="options-container">
            <label className="radio-option">
              <input type="radio" name={`exercise-${index}`} value="yes" />
              <span className="radio-custom"></span>
              Yes
            </label>
            <label className="radio-option">
              <input type="radio" name={`exercise-${index}`} value="no" />
              <span className="radio-custom"></span>
              No
            </label>
          </div>
        );

      case "fill_blank":
        return (
          <input
            type="text"
            className="answer-input"
            name={`exercise-${index}`}
            placeholder="Enter answer here"
            onKeyDown={(e) => {
              // Allow backspace and other normal editing keys
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight"
              ) {
                return;
              }
              // Allow normal text input
              if (e.key.length === 1) {
                return;
              }
            }}
          />
        );

      case "matching":
        // Create shuffled list of meanings for dropdown options
        let allMeanings = [];

        if (exercise.pairs && Array.isArray(exercise.pairs)) {
          // Handle both 'definition' and 'meaning' fields
          allMeanings = exercise.pairs.map((pair) => {
            if (pair.definition) return pair.definition;
            if (pair.meaning) return pair.meaning;
            return "Unknown meaning";
          });
        } else if (exercise.options && Array.isArray(exercise.options)) {
          // Fallback: if data is in options format
          allMeanings = exercise.options;
        } else if (exercise.choices && Array.isArray(exercise.choices)) {
          // Another fallback: if data is in choices format
          allMeanings = exercise.choices;
        }

        const shuffledMeanings = [...allMeanings].sort(
          () => Math.random() - 0.5
        );

        // Debug logging

        return (
          <div className="matching-exercise">
            <p className="matching-instructions">{exercise.instructions}</p>
            <div className="matching-pairs">
              {exercise.pairs && exercise.pairs.length > 0 ? (
                exercise.pairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="matching-pair">
                    <span className="matching-item word-item">{pair.word}</span>
                    <span className="matching-arrow">→</span>
                    <select
                      className="matching-select"
                      name={`exercise-matching-${index}-${pairIndex}`}
                      defaultValue=""
                    >
                      <option value="">Select meaning...</option>
                      {shuffledMeanings.map((meaning, optionIndex) => (
                        <option key={optionIndex} value={meaning}>
                          {meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div className="no-matching-data">
                  <p>No matching pairs available for this exercise.</p>
                  <p>Exercise data: {JSON.stringify(exercise, null, 2)}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "short_answer":
      default:
        return (
          <input
            type="text"
            className="answer-input"
            name={`exercise-${index}`}
            placeholder="Type your answer here..."
            onKeyDown={(e) => {
              // Allow backspace and other normal editing keys
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight"
              ) {
                return;
              }
              // Allow normal text input
              if (e.key.length === 1) {
                return;
              }
            }}
          />
        );
    }
  };

  const renderTestQuestionInput = (question, index) => {
    switch (question.type) {
      case "single_choice":
      case "multiple_choice":
        return (
          <div className="options-container">
            {question.options.map((option, optIndex) => (
              <label
                key={optIndex}
                className={
                  question.type === "multiple_choice"
                    ? "checkbox-option"
                    : "radio-option"
                }
              >
                <input
                  type={
                    question.type === "multiple_choice" ? "checkbox" : "radio"
                  }
                  name={`question-${index}`}
                  value={option}
                />
                <span
                  className={
                    question.type === "multiple_choice"
                      ? "checkbox-custom"
                      : "radio-custom"
                  }
                ></span>
                {option}
              </label>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="options-container">
            <label className="radio-option">
              <input type="radio" name={`question-${index}`} value="yes" />
              <span className="radio-custom"></span>
              Yes
            </label>
            <label className="radio-option">
              <input type="radio" name={`question-${index}`} value="no" />
              <span className="radio-custom"></span>
              No
            </label>
          </div>
        );

      case "fill_blank":
        return (
          <input
            type="text"
            className="answer-input"
            name={`question-${index}`}
            placeholder="Enter answer here"
            onKeyDown={(e) => {
              // Allow backspace and other normal editing keys
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight"
              ) {
                return;
              }
              // Allow normal text input
              if (e.key.length === 1) {
                return;
              }
            }}
          />
        );

      case "matching":
        // Create shuffled list of meanings for dropdown options
        let allMeanings = [];

        if (question.pairs && Array.isArray(question.pairs)) {
          // Handle both 'definition' and 'meaning' fields
          allMeanings = question.pairs.map((pair) => {
            if (pair.definition) return pair.definition;
            if (pair.meaning) return pair.meaning;
            return "Unknown meaning";
          });
        } else if (question.options && Array.isArray(question.options)) {
          // Fallback: if data is in options format
          allMeanings = question.options;
        } else if (question.choices && Array.isArray(question.choices)) {
          // Another fallback: if data is in choices format
          allMeanings = question.choices;
        }

        const shuffledMeanings = [...allMeanings].sort(
          () => Math.random() - 0.5
        );

        return (
          <div className="matching-exercise">
            <div className="matching-pairs">
              {question.pairs && question.pairs.length > 0 ? (
                question.pairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="matching-pair">
                    <span className="matching-item word-item">{pair.word}</span>
                    <span className="matching-arrow">→</span>
                    <select
                      className="matching-select"
                      name={`matching-${index}-${pairIndex}`}
                      defaultValue=""
                    >
                      <option value="">Select meaning...</option>
                      {shuffledMeanings.map((meaning, optionIndex) => (
                        <option key={optionIndex} value={meaning}>
                          {meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div className="no-matching-data">
                  <p>No matching pairs available for this exercise.</p>
                  <p>Exercise data: {JSON.stringify(question, null, 2)}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "short_answer":
      default:
        return (
          <input
            type="text"
            className="answer-input"
            name={`question-${index}`}
            placeholder="Type your answer here..."
            onKeyDown={(e) => {
              // Allow backspace and other normal editing keys
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight"
              ) {
                return;
              }
              // Allow normal text input
              if (e.key.length === 1) {
                return;
              }
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="lessons-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (showLessonReading && currentLesson) {
    return (
      <div className="lessons-page-container">
        <div className="lesson-reading-container">
          <div className="lesson-header">
            <button className="back-button" onClick={handleBackFromReading}>
              ← Back to Lessons
            </button>
            <h1>{currentLesson.title}</h1>
          </div>

          <div className="lesson-content">
            <div className="lesson-section">
              <h3>Introduction</h3>
              <p>{currentLesson.content.introduction}</p>
            </div>

            {currentLesson.content.vocabulary && (
              <div className="lesson-section">
                <h3>Vocabulary</h3>
                <div className="vocabulary-list">
                  {currentLesson.content.vocabulary.map((word, index) => (
                    <div key={index} className="vocabulary-item">
                      <strong>{word.word}</strong>: {word.definition}
                      <div className="example">Example: {word.example}</div>
                      {word.synonyms && word.synonyms.length > 0 && (
                        <div className="synonyms">
                          <strong>Synonyms:</strong> {word.synonyms.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentLesson.content.exercises && (
              <div className="lesson-section">
                <h3>Practice Exercises</h3>

                {!practiceExerciseResults ? (
                  <>
                    <div className="exercises-list">
                      {currentLesson.content.exercises.map(
                        (exercise, index) => (
                          <div key={index} className="exercise-item">
                            <div className="exercise-header">
                              <span className="exercise-number">
                                Exercise {index + 1}
                              </span>
                            </div>
                            <p className="exercise-question">
                              {exercise.question}
                            </p>
                            {renderExerciseInput(exercise, index)}
                          </div>
                        )
                      )}
                    </div>
                    <div className="practice-actions">
                      <button
                        className="check-answers-button"
                        onClick={checkPracticeExercises}
                      >
                        Check Answers
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="practice-results">
                    <div className="results-header">
                      <h4>Practice Exercise Results</h4>
                      <div className="score-display">
                        <span className="score-label">Your Score:</span>
                        <span className="score-value">
                          {practiceExerciseResults.score}%
                        </span>
                      </div>
                    </div>

                    <div className="results-summary">
                      <p>
                        You answered {practiceExerciseResults.correctCount} out
                        of {practiceExerciseResults.totalCount} exercises
                        correctly.
                      </p>
                    </div>

                    <div className="exercise-results">
                      {practiceExerciseResults.results.map((result, index) => (
                        <div
                          key={index}
                          className={`exercise-result-item ${
                            result.isCorrect ? "correct" : "incorrect"
                          }`}
                        >
                          <div className="result-header">
                            <span className="result-number">
                              Exercise {result.exerciseNumber}
                            </span>
                            <span
                              className={`result-status ${
                                result.isCorrect ? "correct" : "incorrect"
                              }`}
                            >
                              {result.isCorrect ? "✓" : "✗"}
                            </span>
                          </div>
                          <div className="result-question">
                            {result.question}
                          </div>
                          <div className="result-answers">
                            <div className="result-answer">
                              <span className="answer-label">Your Answer:</span>
                              <span
                                className={`answer-value ${
                                  result.isCorrect ? "correct" : "incorrect"
                                }`}
                              >
                                {Array.isArray(result.userAnswer)
                                  ? result.userAnswer.join(", ")
                                  : result.userAnswer || "No answer"}
                              </span>
                            </div>
                            <div className="result-answer">
                              <span className="answer-label">
                                Correct Answer:
                              </span>
                              <span className="answer-value correct">
                                {Array.isArray(result.correctAnswer)
                                  ? result.correctAnswer.join(", ")
                                  : result.correctAnswer}
                              </span>
                            </div>
                            {result.explanation && (
                              <div className="result-explanation">
                                <span className="explanation-label">
                                  Explanation:
                                </span>
                                <span className="explanation-text">
                                  {result.explanation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="practice-actions">
                      <button
                        className="retry-exercises-button"
                        onClick={() => setPracticeExerciseResults(null)}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentLesson.content.passage && (
              <div className="lesson-section">
                <h3>Reading Passage</h3>
                <div className="passage-content">
                  {currentLesson.content.passage}
                </div>
              </div>
            )}

            {currentLesson.content.summary && (
              <div className="lesson-section">
                <h3>Summary</h3>
                <p>{currentLesson.content.summary}</p>
              </div>
            )}
          </div>

          <div className="lesson-actions">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {currentLesson.progress === 0 ? (
              <button
                className="mark-complete-button"
                onClick={handleMarkLessonComplete}
              >
                Mark Lesson Complete (50%)
              </button>
            ) : currentLesson.progress === 50 ? (
              <button
                className="start-test-button"
                onClick={handleStartTest}
                disabled={testLoading}
              >
                {testLoading
                  ? "Loading Test..."
                  : "Take Test (Complete to 100%)"}
              </button>
            ) : currentLesson.progress === 100 ? (
              <div className="lesson-completed-simple">
                <div className="completion-header">
                  <div className="completion-icon-simple">✓</div>
                  <div className="completion-text-simple">
                    <h3>Lesson Completed</h3>
                    <p>Great job! You've successfully completed this lesson.</p>
                  </div>
                </div>
                <button
                  className="view-results-simple"
                  onClick={handleStartTest}
                >
                  View Test Results
                </button>
              </div>
            ) : (
              <button
                className="start-test-button"
                onClick={handleStartTest}
                disabled={testLoading}
              >
                {testLoading ? "Loading Test..." : "Take Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showLessonTest && currentLesson) {
    return (
      <div className="lessons-page-container">
        <div className="lesson-test-container">
          <div className="test-header">
            <button className="back-button" onClick={handleBackFromTest}>
              ← Back to Lessons
            </button>
            <h1>Test: {currentLesson.title}</h1>
          </div>

          <div className="test-content">
            {currentTest?.isCompleted ? (
              // Show test results if already completed
              <div className="test-results">
                <div className="results-header">
                  <h3>Test Results</h3>
                  <div className="score-display">
                    <span className="score-label">Your Score:</span>
                    <span className="score-value">{currentTest.score}%</span>
                  </div>
                </div>

                <div className="results-summary">
                  <p>
                    You answered {currentTest.correctAnswers || 0} out of{" "}
                    {currentTest.totalQuestions || 0} questions correctly.
                  </p>
                  <p className={currentTest.passed ? "passed" : "failed"}>
                    {currentTest.passed ? "✅ Test Passed!" : "❌ Test Failed"}
                  </p>
                </div>

                <div className="question-results">
                  {currentTest.questionResults &&
                  currentTest.questionResults.length > 0 ? (
                    currentTest.questionResults.map((result, index) => (
                      <div
                        key={index}
                        className={`result-item ${
                          result.isCorrect ? "correct" : "incorrect"
                        }`}
                      >
                        <div className="result-header">
                          <span className="result-number">
                            Q{result.questionNumber}
                          </span>
                          <span
                            className={`result-status ${
                              result.isCorrect ? "correct" : "incorrect"
                            }`}
                          >
                            {result.isCorrect ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="result-question">{result.question}</div>
                        <div className="result-answers">
                          <div className="result-answer">
                            <span className="answer-label">Your Answer:</span>
                            <span
                              className={`answer-value ${
                                result.isCorrect ? "correct" : "incorrect"
                              }`}
                            >
                              {Array.isArray(result.userAnswer)
                                ? result.userAnswer.join(", ")
                                : result.userAnswer || "No answer"}
                            </span>
                          </div>
                          <div className="result-answer">
                            <span className="answer-label">
                              Correct Answer:
                            </span>
                            <span className="answer-value correct">
                              {Array.isArray(result.correctAnswer)
                                ? result.correctAnswer.join(", ")
                                : result.correctAnswer}
                            </span>
                          </div>
                          {result.explanation && (
                            <div className="result-explanation">
                              <span className="explanation-label">
                                Explanation:
                              </span>
                              <span className="explanation-text">
                                {result.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <p>No detailed results available for this test.</p>
                      <p>Score: {currentTest.score}%</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Show test questions if not completed
              <>
                <p className="test-instructions">
                  Answer all questions carefully. You have unlimited time.
                </p>

                <div className="questions-list">
                  {currentTest?.content?.questions ? (
                    currentTest.content.questions.map((question, index) => (
                      <div key={index} className="question-item">
                        <h4>Question {question.questionNumber}</h4>
                        <p>{question.question}</p>
                        {renderTestQuestionInput(question, index)}
                      </div>
                    ))
                  ) : (
                    <div className="no-questions">
                      <p>No test questions available for this lesson.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {!currentTest?.isCompleted && (
            <div className="test-actions">
              <button
                className="submit-test-button"
                onClick={() => {
                  const answers = [];

                  // Handle different question types
                  currentTest.content.questions.forEach((question, index) => {
                    if (question.type === "matching") {
                      // Handle matching questions
                      const selects = document.querySelectorAll(
                        `select[name^="matching-${index}"]`
                      );
                      const matchingAnswers = [];
                      selects.forEach((select) => {
                        matchingAnswers.push(select.value);
                      });
                      answers[index] = matchingAnswers;
                    } else if (question.type === "multiple_choice") {
                      // Handle multiple choice questions
                      const checkboxes = document.querySelectorAll(
                        `input[name="question-${index}"]:checked`
                      );
                      const multipleAnswers = [];
                      checkboxes.forEach((checkbox) => {
                        multipleAnswers.push(checkbox.value);
                      });
                      answers[index] = multipleAnswers;
                    } else {
                      // Handle single choice, fill_blank, etc.
                      const input =
                        document.querySelector(
                          `input[name="question-${index}"]:checked`
                        ) ||
                        document.querySelector(
                          `input[name="question-${index}"]`
                        );
                      answers[index] = input ? input.value : "";
                    }
                  });

                  const timeSpent = 5; // Mock time spent

                  // Debug logging

                  handleTestComplete({
                    answers,
                    timeSpent,
                    score: 85, // Mock score
                  });
                }}
              >
                Submit Test
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lessons-page-container">
      <div className="lessons-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>{getSectionTitle()} Lessons</h1>
        <p>Level: {user?.lessonType?.toUpperCase()}</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadLessons}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lessons...</p>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-info">
                  <div className="lesson-info-header">
                    <h3>Lesson {lesson.lessonNumber}</h3>
                    <h4>{lesson.title}</h4>
                  </div>
                  <div className="progress-percentage">
                    {lesson.progress || 0}% Complete
                  </div>
                  <div className="lesson-progress-info">
                    <div className="lesson-status">
                      {lesson.isCompleted ? (
                        <span className="completed">✓ Completed</span>
                      ) : (
                        <span className="not-started">○ Not Started</span>
                      )}
                    </div>
                  </div>
                  <div className="lesson-actions">
                    <button
                      className="start-lesson-button"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      {lesson.isCompleted ? "Review" : "Start"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-lessons">
              <p>No lessons available for this section.</p>
              <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
