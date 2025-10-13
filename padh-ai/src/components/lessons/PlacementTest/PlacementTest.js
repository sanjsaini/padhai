import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlacementTest.css";
import questionsData from "../../../data/data.json";
import api from "../../../api/client";
import { showSuccess, showError } from "../../../utils/toast";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";

const PlacementTest = ({ onFinishTest, onBack }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [userTestContent] = useState(null);
  const [loadingTestContent] = useState(false);
  const [showReadingPassage, setShowReadingPassage] = useState(true);

  const localQuestions = questionsData.questions;
  const questions = userTestContent?.questions || localQuestions;

  // useEffect(() => {
  //   // Try to get user-specific test content (if authenticated)
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     setLoadingTestContent(true);

  //     // First try to get existing user test content
  //     api.getUserTestContent()
  //       .then((res) => {
  //         if (res?.testContent?.readingPassage && res?.testContent?.questions?.length) {
  //           setUserTestContent(res.testContent);
  //           console.log('Retrieved existing test content for user');
  //         }
  //       })

  //       .then((res) => {
  //         if (res?.testContent?.readingPassage && res?.testContent?.questions?.length) {
  //           setUserTestContent(res.testContent);
  //           console.log('Generated and stored new test content for user');
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Failed to get/generate test content:', error);
  //         // Fall back to local questions
  //       })
  //       .finally(() => {
  //         setLoadingTestContent(false);
  //       });
  //   }
  // }, []);

  const handleStartTest = () => {
    if (showReadingPassage && userTestContent?.readingPassage) {
      setShowReadingPassage(false);
    } else {
      setIsTestStarted(true);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));
  };

  const handleMultipleChoiceChange = (option) => {
    const currentAnswers = Array.isArray(answers[currentQuestion])
      ? answers[currentQuestion]
      : [];
    let newAnswers;

    if (currentAnswers.includes(option)) {
      newAnswers = currentAnswers.filter((item) => item !== option);
    } else {
      newAnswers = [...currentAnswers, option];
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: newAnswers,
    }));
  };

  const getSelectionStatus = () => {
    const currentAnswer = answers[currentQuestion];
    const question = questions[currentQuestion];

    if (question.type === "multiple_choice" && question.selectCount) {
      return Array.isArray(currentAnswer) ? currentAnswer.length : 0;
    }
    return null;
  };

  const isCurrentQuestionAnswered = () => {
    const currentAnswer = answers[currentQuestion];
    const question = questions[currentQuestion];

    if (!currentAnswer) return false;

    switch (question.type) {
      case "multiple_choice":
        return Array.isArray(currentAnswer) && currentAnswer.length > 0;
      case "single_choice":
      case "yes_no":
        return currentAnswer && currentAnswer.trim() !== "";
      case "fill_blank":
      case "short_answer":
        return currentAnswer && currentAnswer.trim() !== "";
      default:
        return currentAnswer && currentAnswer.trim() !== "";
    }
  };

  const checkAnswer = (userAnswer, correctAnswer, questionType) => {
    if (questionType === "multiple_choice") {
      const correctAnswers = Array.isArray(correctAnswer)
        ? correctAnswer
        : [correctAnswer];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

      return (
        correctAnswers.every((answer) =>
          userAnswers.some(
            (userAns) =>
              userAns?.toString().toLowerCase().trim() ===
              answer?.toString().toLowerCase().trim()
          )
        ) && userAnswers.length === correctAnswers.length
      );
    } else {
      const userAns = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
      const correctAns = Array.isArray(correctAnswer)
        ? correctAnswer[0]
        : correctAnswer;

      return (
        userAns &&
        userAns?.toString().toLowerCase().trim() ===
          correctAns?.toString().toLowerCase().trim()
      );
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const results = {
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(answers).length,
        correctAnswers: 0,
        answers: answers,
        questions: questions,
        score: 0,
        questionResults: [],
      };

      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = checkAnswer(
          userAnswer,
          question.answer,
          question.type
        );

        if (isCorrect) results.correctAnswers++;

        results.questionResults.push({
          question: question.question,
          questionNumber: question.questionNumber,
          userAnswer: userAnswer,
          correctAnswer: question.answer,
          isCorrect: isCorrect,
          type: question.type,
          category: question.category || "vocabulary", // Add category
          options: question.options,
        });
      });

      results.score = Math.round(
        (results.correctAnswers / results.totalQuestions) * 100
      );

      setTestResults(results);
      setShowResults(true);

      // Store placement test results locally for now
      // They will be submitted to backend when user clicks "Start Learning"
      localStorage.setItem("placementTestResults", JSON.stringify(results));
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setIsTestStarted(false);
    }
  };

  const handleFinishTest = async () => {
    try {
      // Determine lesson type based on test results
      let lessonType = "medium"; // default
      if (testResults.score >= 85) {
        lessonType = "advanced";
      } else if (testResults.score >= 50) {
        lessonType = "medium";
      } else {
        lessonType = "easy";
      }

      // Get current user from AuthContext
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!currentUser) {
        console.error("❌ No user found in localStorage");
        navigate("/");
        return;
      }

      // Update user with placement test results and level
      const updatedUser = {
        ...currentUser,
        lessonType: lessonType,
        placementTestCompleted: true,
        placementTestResults: testResults,
      };

      // Store updated user data
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update AuthContext
      await login(updatedUser);

      // Submit placement test results to backend
      try {
        const response = await api.submitPlacementTest({
          totalQuestions: testResults.totalQuestions,
          correctAnswers: testResults.correctAnswers,
          score: testResults.score,
          answers: testResults.answers,
          questionResults: testResults.questionResults,
        });

        if (response.user) {
        }

        // Clear stored placement test results since they're now saved
        localStorage.removeItem("placementTestResults");
      } catch (error) {
        console.error("❌ Failed to submit placement test results:", error);
        showError("Failed to submit placement test results.");
        // Continue anyway - user can still access lessons
      }

      // Navigate to lesson dashboard
      showSuccess("Placement test completed! Welcome to your lessons.");

      navigate("/lessons");
    } catch (error) {
      console.error("❌ Error in handleFinishTest:", error);
      // Fallback: still navigate to lesson dashboard
      navigate("/lessons");
    }
  };

  const renderResults = () => {
    if (!testResults) return null;

    const correctCount = testResults.correctAnswers;
    const incorrectCount = testResults.totalQuestions - correctCount;
    const percentage = testResults.score;

    return (
      <div className="placement-container">
        <div className="airplane airplane-1"></div>
        <div className="airplane airplane-2"></div>
        <div className="results-content">
          <h1 className="results-title">{t.testResults}</h1>

          {/* Score Summary */}
          <div className="score-summary">
            <div className="score-circle">
              <span className="score-percentage">{percentage}%</span>
            </div>
            <div className="score-details">
              <div className="score-item correct">
                <span className="score-label">{t.correct}:</span>
                <span className="score-value">{correctCount}</span>
              </div>
              <div className="score-item incorrect">
                <span className="score-label">{t.incorrect}:</span>
                <span className="score-value">{incorrectCount}</span>
              </div>
              <div className="score-item total">
                <span className="score-label">{t.total}:</span>
                <span className="score-value">
                  {testResults.totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Question Results */}
          <div className="question-results">
            <h3 className="results-subtitle">{t.questionDetails}</h3>
            <div className="results-list">
              {testResults.questionResults.map((result, index) => (
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
                      <span className="answer-label">{t.yourAnswer}:</span>
                      <span className="answer-value">
                        {Array.isArray(result.userAnswer)
                          ? result.userAnswer.join(", ")
                          : result.userAnswer || t.noAnswer}
                      </span>
                    </div>
                    <div className="result-answer">
                      <span className="answer-label">{t.correctAnswer}:</span>
                      <span className="answer-value">
                        {Array.isArray(result.correctAnswer)
                          ? result.correctAnswer.join(", ")
                          : result.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="results-actions">
            <button className="placement-button" onClick={handleFinishTest}>
              {t.startLearning}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  // Reading Passage Display
  if (
    !isTestStarted &&
    !showReadingPassage &&
    userTestContent?.readingPassage
  ) {
    return (
      <div className="placement-container">
        <div className="airplane airplane-1"></div>
        <div className="airplane airplane-2"></div>
        <div className="placement-content">
          <button
            className="back-button"
            onClick={() => setShowReadingPassage(true)}
          >
            ← Back
          </button>
          <h1 className="placement-title">Reading Comprehension Test</h1>
          <div className="reading-passage-container">
            <h3>Read the following passage:</h3>
            <div className="reading-passage">
              {userTestContent.readingPassage}
            </div>
            <div className="reading-instructions">
              <p>
                Read the passage carefully. When you're ready, click "Start
                Test" to answer questions about what you've read.
              </p>
            </div>
            <button className="placement-button" onClick={handleStartTest}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isTestStarted) {
    return (
      <div className="placement-container">
        <div className="airplane airplane-1"></div>
        <div className="airplane airplane-2"></div>
        <div className="placement-content">
          <h1 className="placement-title">{t.testTitle}</h1>
          <div className="placement-description">
            <p>
              This short test will help
              <br />
              us understand your
              <br />
              English skills so we can
              <br />
              create lessons just for
              <br />
              you. It takes about 5-7
              <br />
              minutes.
            </p>
            {loadingTestContent && (
              <div className="loading-indicator">
                <p>Generating personalized test content...</p>
              </div>
            )}
          </div>
          <button
            className="placement-button"
            onClick={handleStartTest}
            disabled={loadingTestContent}
          >
            {loadingTestContent ? "Preparing Test..." : t.submitButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="placement-container">
      <div className="airplane airplane-1"></div>
      <div className="airplane airplane-2"></div>
      <div className="question-content">
        <div className="question-progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
        <h1 className="question-title">{t.questionText}</h1>
        <div className="question-card">
          <div className="question-header">
            <span className="question-number-display">
              Question {questions[currentQuestion].questionNumber}
            </span>
            {getSelectionStatus() && (
              <span className="selection-status">{getSelectionStatus()}</span>
            )}
          </div>
          <p className="question-text">{questions[currentQuestion].question}</p>
          {renderQuestionInput()}
        </div>
        <div className="question-actions">
          {currentQuestion > 0 && (
            <button className="question-button back-btn" onClick={handleBack}>
              {t.backButton}
            </button>
          )}
          <button
            className={`question-button next-btn ${
              !isCurrentQuestionAnswered() ? "disabled" : ""
            }`}
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered()}
          >
            {currentQuestion === questions.length - 1
              ? t.submitButton
              : t.nextButton}
          </button>
        </div>
        <div className="progress-indicator">
          <span className="progress-text">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
      </div>
    </div>
  );

  function renderQuestionInput() {
    const question = questions[currentQuestion];
    const currentAnswer = answers[currentQuestion];

    switch (question.type) {
      case "single_choice":
        return (
          <div className="options-container">
            {question.options.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
                <span className="radio-custom"></span>
                {option}
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="options-container">
            {question.options.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={
                    Array.isArray(currentAnswer) &&
                    currentAnswer.includes(option)
                  }
                  onChange={() => handleMultipleChoiceChange(option)}
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
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value="yes"
                checked={currentAnswer === "yes"}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
              <span className="radio-custom"></span>
              Yes
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value="no"
                checked={currentAnswer === "no"}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
              <span className="radio-custom"></span>
              No
            </label>
          </div>
        );

      case "fill_blank":
      case "short_answer":
      default:
        return (
          <input
            type="text"
            className="answer-input"
            placeholder={
              question.type === "fill_blank"
                ? "Enter answer here"
                : "Type your answer here..."
            }
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        );
    }
  }
};

export default PlacementTest;
