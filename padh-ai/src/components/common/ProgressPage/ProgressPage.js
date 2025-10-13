import React, { useState, useEffect } from "react";
import "./ProgressPage.css";
import api from "../../../api/client";

const ProgressPage = ({ lessonProgress, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    sections: {},
    overallStats: {
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
    },
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const sections = ["vocabulary", "grammar", "punctuation", "reading"];
      const sectionData = {};
      let totalLessons = 0;
      let completedLessons = 0;
      let totalScore = 0; // sum of test percentages
      let totalQuestions = 0;
      let correctAnswers = 0;
      let totalTestsCompleted = 0;

      for (const section of sections) {
        try {
          const data = await api.getUserLessons(section);
          const lessons = data.lessons || [];

          const completedSectionLessons = lessons.filter(
            (lesson) => lesson.isCompleted
          );

          // Get test data for completed lessons
          let sectionScore = 0; // sum of test percentages for this section
          let sectionQuestions = 0;
          let sectionCorrect = 0;
          let sectionTestsCompleted = 0;

          for (const lesson of completedSectionLessons) {
            try {
              // Fetch test data for each completed lesson
              const testData = await api.getLessonTest(lesson.id);
              if (testData.test && testData.test.isCompleted) {
                sectionScore += testData.test.score || 0;
                sectionQuestions += testData.test.totalQuestions || 0;
                sectionCorrect += testData.test.correctAnswers || 0;
                sectionTestsCompleted += 1;
              }
            } catch (error) {
              console.error(
                `Error fetching test data for lesson ${lesson.id}:`,
                error
              );
            }
          }

          sectionData[section] = {
            name: section.charAt(0).toUpperCase() + section.slice(1),
            totalLessons: lessons.length,
            completedLessons: completedSectionLessons.length,
            averageScore:
              sectionTestsCompleted > 0
                ? Math.round(sectionScore / sectionTestsCompleted)
                : 0,
            totalQuestions: sectionQuestions,
            correctAnswers: sectionCorrect,
            lessons: await Promise.all(
              lessons.map(async (lesson) => {
                let testScore = 0;
                let testQuestions = 0;
                let testCorrectAnswers = 0;
                let testCompleted = false;

                if (lesson.isCompleted) {
                  try {
                    const testData = await api.getLessonTest(lesson.id);
                    if (testData.test && testData.test.isCompleted) {
                      testScore = testData.test.score || 0;
                      testQuestions = testData.test.totalQuestions || 0;
                      testCorrectAnswers = testData.test.correctAnswers || 0;
                      testCompleted = true;
                    }
                  } catch (error) {
                    console.error(
                      `Error fetching test data for lesson ${lesson.id}:`,
                      error
                    );
                  }
                }

                const passingScore =
                  typeof lesson.passingScore === "number"
                    ? lesson.passingScore
                    : 70;
                return {
                  id: lesson.id,
                  title: lesson.title,
                  lessonNumber: lesson.lessonNumber,
                  isCompleted: lesson.isCompleted,
                  progress: lesson.progress || 0,
                  testScore,
                  testQuestions,
                  testCorrectAnswers,
                  testTaken: testCompleted,
                  testPassed: testCompleted ? testScore >= passingScore : false,
                  completedAt: lesson.completedAt,
                };
              })
            ),
          };

          totalLessons += lessons.length;
          completedLessons += completedSectionLessons.length;
          totalScore += sectionScore;
          totalQuestions += sectionQuestions;
          correctAnswers += sectionCorrect;
          totalTestsCompleted += sectionTestsCompleted;
        } catch (error) {
          console.error(`Error loading ${section} progress:`, error);
          sectionData[section] = {
            name: section.charAt(0).toUpperCase() + section.slice(1),
            totalLessons: 0,
            completedLessons: 0,
            averageScore: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            lessons: [],
          };
        }
      }

      setProgressData({
        sections: sectionData,
        overallStats: {
          totalLessons,
          completedLessons,
          averageScore:
            totalTestsCompleted > 0
              ? Math.round(totalScore / totalTestsCompleted)
              : 0,
          totalQuestions,
          correctAnswers,
        },
      });
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#ff8e32"; // Orange for excellent
    if (score >= 60) return "#4ade80"; // Green for good
    return "#ef4444"; // Red for needs improvement
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="progress-page-content">
        <div className="elegant-loader">
          <div className="loader-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loader-title">Loading Your Progress</h3>
          <p className="loader-subtitle">Fetching your learning journey...</p>
        </div>
      </div>
    );
  }

  const { sections, overallStats } = progressData;

  return (
    <div className="progress-page-content">
      <div className="progress-header">
        <h1 className="progress-title">Your Learning Journey</h1>
        <p className="progress-subtitle">
          Track your progress across all sections
        </p>
      </div>

      {/* Overall Stats */}
      <div className="overall-stats">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-number">
            {overallStats.completedLessons}/{overallStats.totalLessons}
          </div>
          <div className="stat-label">Lessons Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{overallStats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">
            {overallStats.correctAnswers}/{overallStats.totalQuestions}
          </div>
          <div className="stat-label">Questions Correct</div>
        </div>
      </div>

      {/* Section Progress */}
      <div className="section-progress">
        <h2 className="section-title">Progress by Section</h2>
        <div className="section-cards">
          {Object.entries(sections).map(([sectionKey, section]) => (
            <div key={sectionKey} className="section-card">
              <div className="section-header">
                <div className="section-info">
                  <h3 className="section-name">{section.name}</h3>
                </div>
                <div className="section-score">
                  <div className="score-circle">
                    <svg className="score-svg" viewBox="0 0 36 36">
                      <path
                        className="score-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="score-fill"
                        strokeDasharray={`${
                          section.totalLessons > 0
                            ? Math.round(
                                (section.completedLessons /
                                  section.totalLessons) *
                                  100
                              )
                            : 0
                        }, 100`}
                        stroke={getScoreColor(section.averageScore)}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="score-text">
                      {section.totalLessons > 0
                        ? Math.round(
                            (section.completedLessons / section.totalLessons) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="section-stats">
                <div className="mini-stat">
                  <span className="mini-stat-label">Questions:</span>
                  <span className="mini-stat-value">
                    {section.correctAnswers}/{section.totalQuestions}
                  </span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-label">Performance:</span>
                  <span
                    className="mini-stat-value"
                    style={{
                      color:
                        section.totalLessons === 0
                          ? "#6b7280"
                          : getScoreColor(section.averageScore),
                    }}
                  >
                    {section.totalLessons === 0
                      ? "No lessons yet"
                      : getScoreLabel(section.averageScore)}
                  </span>
                </div>
              </div>

              {/* Individual Lessons */}
              <div className="lessons-list">
                {section.lessons.map((lesson) => {
                  const statusClass = lesson.testTaken
                    ? lesson.testPassed
                      ? "passed"
                      : "failed"
                    : lesson.progress > 0
                    ? "in-progress"
                    : "pending";
                  const statusText = lesson.testTaken
                    ? `${lesson.testPassed ? "Passed" : "Failed"} (${
                        lesson.testScore
                      }%)`
                    : lesson.progress > 0
                    ? `${lesson.progress}% Complete`
                    : "Test Pending";

                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-item ${statusClass}`}
                    >
                      <div className="lesson-info">
                        <span className="lesson-number">
                          Lesson {lesson.lessonNumber}
                        </span>
                        <span className="lesson-title">{lesson.title}</span>
                      </div>
                      <div className="lesson-status-text">{statusText}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      {overallStats.completedLessons > 0 && (
        <div className="motivational-section">
          <div className="motivation-icon">🎉</div>
          <h3 className="motivation-title">Keep Going!</h3>
          <p className="motivation-text">
            {overallStats.averageScore >= 80
              ? "Excellent work! You're mastering these lessons!"
              : overallStats.averageScore >= 60
              ? "Great progress! Keep practicing to improve even more!"
              : "Good start! Practice more to boost your scores!"}
          </p>
        </div>
      )}

      {/* Empty State */}
      {overallStats.completedLessons === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3 className="empty-title">No Progress Yet</h3>
          <p className="empty-text">
            Complete some lessons to see your progress here!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
