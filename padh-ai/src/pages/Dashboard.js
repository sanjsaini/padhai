import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePreventNavigation } from "../hooks/usePreventNavigation";
import ProgressPage from "../components/common/ProgressPage/ProgressPage";
import ProfileSettings from "../components/common/ProfileSettings/ProfileSettings";
import { showSuccess, showError, showInfo } from "../utils/toast";
import api from "../api/client";

// Settings Content Component
const SettingsContent = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const languages = [
    "English",
    "Hindi",
    "Gujarati",
    "Spanish",
    "French",
    "Punjabi",
    "Telugu",
  ];

  const handleLanguageSelect = (language) => {
    changeLanguage(language);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="settings-section">
      <h3>Language Settings</h3>
      <div className="language-dropdown-container">
        <div
          className="language-selector"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        >
          <span className="language-icon">🌐</span>
          <span className="selected-language">{currentLanguage}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        {showLanguageDropdown && (
          <div className="language-dropdown-menu">
            {languages.map((language) => (
              <div
                key={language}
                className={`language-option ${
                  currentLanguage === language ? "selected" : ""
                }`}
                onClick={() => handleLanguageSelect(language)}
              >
                {language}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const userName = user?.name || user?.email || "User";
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false); // legacy (modal) - no longer used
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [lessonProgress, setLessonProgress] = useState({});
  const [showProgressPage, setShowProgressPage] = useState(false);
  const [showProfileSettingsPage, setShowProfileSettingsPage] = useState(false);
  const [sectionLoading, setSectionLoading] = useState({});
  const [sectionProgress, setSectionProgress] = useState({});
  const [sectionHasLessons, setSectionHasLessons] = useState({});
  const [generation, setGeneration] = useState({
    active: false,
    section: null,
    progress: 0,
    label: "",
  });

  // Use custom hook to prevent navigation
  usePreventNavigation(true);

  // Redirect logic
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (!user.placementTestCompleted) {
      // User hasn't completed placement test, redirect to placement test
      navigate("/placement-test");
    }
    // If user has completed placement test, stay in dashboard
  }, [user, navigate]);

  // Load lesson progress from localStorage
  useEffect(() => {
    const savedProgress = JSON.parse(
      localStorage.getItem("lessonProgress") || "{}"
    );
    setLessonProgress(savedProgress);
  }, []);

  const loadSectionProgress = useCallback(async () => {
    if (!user) return;

    const sections = ["vocabulary", "grammar", "punctuation", "reading"];
    const progressData = {};
    const hasData = {};

    for (const section of sections) {
      try {
        const data = await api.getUserLessons(section);
        const lessons = data.lessons || [];

        hasData[section] = lessons.length > 0;
        if (lessons.length > 0) {
          const totalLessons = lessons.length;
          const completedLessons = lessons.filter(
            (lesson) => lesson.isCompleted
          ).length;
          const progressPercentage = Math.round(
            (completedLessons / totalLessons) * 100
          );
          progressData[section] = progressPercentage;
        } else {
          progressData[section] = 0;
        }
      } catch (error) {
        console.error(`Error loading ${section} progress:`, error);
        progressData[section] = 0;
      }
    }

    setSectionProgress(progressData);
    setSectionHasLessons(hasData);
  }, [user]);

  // Load section progress
  useEffect(() => {
    loadSectionProgress();
  }, [loadSectionProgress]);

  const getLessonData = () => {
    const level = user?.lessonType || "easy";

    const getSubtitle = (skill) => {
      const subtitles = {
        vocabulary:
          level === "easy"
            ? "Basic Words & Phrases"
            : level === "medium"
            ? "Intermediate Vocabulary"
            : "Advanced Word Usage",
        grammar:
          level === "easy"
            ? "Simple Grammar Rules"
            : level === "medium"
            ? "Complex Grammar Patterns"
            : "Advanced Grammar Structures",
        punctuation:
          level === "easy"
            ? "Basic Punctuation Marks"
            : level === "medium"
            ? "Advanced Punctuation Rules"
            : "Professional Writing Standards",
        reading:
          level === "easy"
            ? "Simple Reading Passages"
            : level === "medium"
            ? "Complex Reading Comprehension"
            : "Advanced Text Analysis",
      };
      return subtitles[skill.toLowerCase()];
    };

    const mk = (key) => {
      const lower = key.toLowerCase();
      const isGenerating =
        sectionLoading[lower] ||
        (generation.active && generation.section === lower);
      const hasLessons = !!sectionHasLessons[lower];
      const progress = sectionProgress[lower] || 0;
      let buttonText = t.buttonStart;
      if (isGenerating) buttonText = t.buttonGenerating;
      else if (!hasLessons) buttonText = t.buttonGenerate;
      else if (progress > 0 && progress < 100) buttonText = t.buttonContinue;
      else if (progress === 100) buttonText = t.buttonReview;
      return {
        key: lower,
        skill: key,
        lesson: getSubtitle(lower),
        buttonText,
        progress,
        disabled: sectionLoading[lower],
        loading: isGenerating,
      };
    };

    return [mk("Vocabulary"), mk("Grammar"), mk("Punctuation"), mk("Reading")];
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = (page) => {
    setActivePage(page);
    // Clear logout confirmation when navigating to other pages
    setShowLogoutConfirm(false);
    // Always close sidebar when switching tabs
    setIsSidebarOpen(false);

    // Handle navigation logic
    switch (page) {
      case "dashboard":
        // Hide progress page and show dashboard
        setShowProgressPage(false);
        setShowProfileSettingsPage(false);
        break;
      case "progress":
        // Show progress page
        setShowProfileSettingsPage(false);
        setShowProgressPage(true);
        break;
      case "account":
        // Navigate to account page or show account modal
        break;
      case "settings":
        // Open profile settings full page (not modal)
        setShowProgressPage(false);
        setShowProfileSettingsPage(true);
        break;
      case "logout":
        // Ask for confirmation before logout
        setShowLogoutConfirm(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmLogout = () => {
    try {
      setShowLogoutConfirm(false);
      logout();
      localStorage.removeItem("userTestData");
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed", e);
      setShowLogoutConfirm(false);
    }
  };

  const handleLessonClick = async (skill) => {
    const section = skill.toLowerCase();
    let timer = null;

    try {
      // First check if lessons already exist in backend. If yes, just navigate.
      try {
        const existing = await api.getUserLessons(section);
        const lessons = existing?.lessons || [];
        if (lessons.length > 0) {
          navigate(`/lessons/${section}`);
          return; // Do not trigger generation or show generation toasts
        }
      } catch (preloadErr) {
        // If fetching fails (e.g., first time or network), fall through to generation
      }

      // Start custom loader
      setGeneration({
        active: true,
        section,
        progress: 5,
        label: `Generating ${section} lessons...`,
      });
      timer = setInterval(() => {
        setGeneration((prev) => {
          if (!prev.active) return prev;
          // Keep simulated progress conservative (max 25%) until server finishes
          const inc = Math.floor(1 + Math.random() * 2); // 1-2%
          const next = Math.min(25, prev.progress + inc);
          return { ...prev, progress: next };
        });
      }, 150);

      setSectionLoading((prev) => ({ ...prev, [section]: true }));
      // Generate up to 3 lessons for this section (idempotent)
      // Only show info toast when we actually trigger generation
      showInfo(`Generating ${section} lessons...`);
      await api.generateSectionLessons(section);
      clearInterval(timer);
      setGeneration((prev) => ({ ...prev, progress: 100 }));
      setTimeout(
        () =>
          setGeneration({
            active: false,
            section: null,
            progress: 0,
            label: "",
          }),
        500
      );
      showSuccess(
        `${
          section.charAt(0).toUpperCase() + section.slice(1)
        } lessons generated.`
      );
      // Navigate to lessons page
      navigate(`/lessons/${section}`);
    } catch (e) {
      console.error("Error generating lessons: ", e);
      showError("Failed to generate lessons. Please try again.");
      // Clear the generation state on error
      if (timer) clearInterval(timer);
      setGeneration({
        active: false,
        section: null,
        progress: 0,
        label: "",
      });
    } finally {
      setSectionLoading((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleBackFromProgress = () => {
    setShowProgressPage(false);
    setActivePage("dashboard");
  };

  // Show progress page
  if (showProgressPage) {
    return (
      <div className="dashboard-container">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
        )}

        {/* Settings Modal - removed */}

        {/* Sidebar Navigation */}
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">{t.menuTitle}</h3>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => handleSidebarItemClick("dashboard")}
            >
              {t.dashboardTitle}
            </button>
            <button
              className={`sidebar-item ${
                activePage === "progress" ? "active" : ""
              }`}
              onClick={() => handleSidebarItemClick("progress")}
            >
              {t.progressButton}
            </button>
            <button
              className="sidebar-item"
              onClick={() => handleSidebarItemClick("settings")}
            >
              {t.settings}
            </button>
            <button
              className="sidebar-item logout-button"
              onClick={() => handleSidebarItemClick("logout")}
            >
              {t.logoutButton}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <button className="menu-button" onClick={handleMenuClick}>
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            <h1 className="dashboard-title">Progress</h1>
          </div>

          {/* Progress Content */}
          <div className="progress-content">
            <ProgressPage
              lessonProgress={lessonProgress}
              onBack={handleBackFromProgress}
            />
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div
            className="settings-overlay"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              className="settings-modal confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-header">
                <h2>Confirm Logout</h2>
                <button
                  className="settings-close"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  ×
                </button>
              </div>
              <div className="confirm-content">
                <p className="confirm-text">Are you sure you want to logout?</p>
              </div>
              <div className="confirm-actions">
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-logout"
                  onClick={handleConfirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show Profile Settings page
  if (showProfileSettingsPage) {
    return (
      <div className="dashboard-container">
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
        )}
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">{t.menuTitle}</h3>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => handleSidebarItemClick("dashboard")}
            >
              {t.dashboardTitle}
            </button>
            <button
              className={`sidebar-item ${
                activePage === "progress" ? "active" : ""
              }`}
              onClick={() => handleSidebarItemClick("progress")}
            >
              {t.progressButton}
            </button>
            <button
              className={`sidebar-item ${
                activePage === "settings" ? "active" : ""
              }`}
              onClick={() => handleSidebarItemClick("settings")}
            >
              Profile Settings
            </button>
            <button
              className="sidebar-item logout-button"
              onClick={() => handleSidebarItemClick("logout")}
            >
              {t.logoutButton}
            </button>
          </nav>
        </div>

        <div className="main-content">
          <div className="dashboard-header">
            <button className="menu-button" onClick={handleMenuClick}>
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            <h1 className="dashboard-title">{t.profileSettings}</h1>
          </div>

          <div className="profile-settings-container">
            <ProfileSettings />
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div
            className="settings-overlay"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              className="settings-modal confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-header">
                <h2>Confirm Logout</h2>
                <button
                  className="settings-close"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  ×
                </button>
              </div>
              <div className="confirm-content">
                <p className="confirm-text">Are you sure you want to logout?</p>
              </div>
              <div className="confirm-actions">
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-logout"
                  onClick={handleConfirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-overlay" onClick={handleSettingsClose}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="settings-close" onClick={handleSettingsClose}>
                ×
              </button>
            </div>
            <div className="settings-content">
              <SettingsContent />
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="settings-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="settings-modal confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-header">
              <h2>Confirm Logout</h2>
              <button
                className="settings-close"
                onClick={() => setShowLogoutConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="confirm-content">
              <p className="confirm-text">Are you sure you want to logout?</p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-logout" onClick={handleConfirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">{t.menuTitle}</h3>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleSidebarItemClick("dashboard")}
          >
            {t.dashboardTitle}
          </button>
          <button
            className={`sidebar-item ${
              activePage === "progress" ? "active" : ""
            }`}
            onClick={() => handleSidebarItemClick("progress")}
          >
            {t.progressButton}
          </button>
          <button
            className={`sidebar-item ${
              activePage === "settings" ? "active" : ""
            }`}
            onClick={() => handleSidebarItemClick("settings")}
          >
            {t.profileSettings}
          </button>
          <button
            className="sidebar-item logout-button"
            onClick={() => handleSidebarItemClick("logout")}
          >
            {t.logoutButton}
          </button>
        </nav>
      </div>
      {generation.active && (
        <div className="generation-overlay" role="status" aria-live="polite">
          <div className="generation-card">
            <div className="generation-title">{generation.label}</div>
            <div className="generation-progress">
              <svg className="gen-svg" viewBox="0 0 120 120">
                <circle className="gen-bg" cx="60" cy="60" r="54" />
                <circle
                  className="gen-fill"
                  cx="60"
                  cy="60"
                  r="54"
                  style={{
                    strokeDasharray: `${Math.max(
                      Math.round((generation.progress / 100) * 339),
                      10
                    )} 339`,
                  }}
                />
                <text x="60" y="66" textAnchor="middle" className="gen-text">
                  {generation.progress}%
                </text>
              </svg>
            </div>
            <div className="generation-sub">
              Please wait while we prepare your lessons…
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <button className="menu-button" onClick={handleMenuClick}>
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <h1 className="dashboard-title">{t.dashboardTitle}</h1>
        </div>

        {/* Greeting Section */}
        <div className="greeting-section">
          <h2 className="greeting-title">Hi {userName}!</h2>
          <p className="greeting-subtitle">{t.greetingSubtitle}</p>

          {user?.placementTestResults && (
            <div className="test-score-display">
              <p className="test-score-text">
                Your placement test score:{" "}
                <strong>{user.placementTestResults.score}%</strong>
              </p>
              <p className="test-score-details">
                {user.placementTestResults.correctAnswers} out of{" "}
                {user.placementTestResults.totalQuestions} questions correct
              </p>
              <p className="test-level-text">
                Your level: <strong>{user.lessonType?.toUpperCase()}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Lesson Progress Cards */}
        <div className="lessons-container">
          {getLessonData().map((lesson, index) => (
            <div key={index} className="lesson-card">
              <div className="lesson-info">
                <h3 className="lesson-skill">{lesson.skill}</h3>
                <p className="lesson-number">{lesson.lesson}</p>
              </div>
              <div className="lesson-actions">
                <button
                  className={`lesson-button ${
                    lesson.disabled
                      ? "disabled"
                      : lesson.generateOnClick
                      ? "generate"
                      : lesson.progress === 0
                      ? "start"
                      : "continue"
                  }`}
                  onClick={() =>
                    !lesson.disabled &&
                    (!generation.active || generation.section === lesson.key) &&
                    handleLessonClick(lesson.skill)
                  }
                  disabled={
                    lesson.disabled ||
                    (generation.active && generation.section !== lesson.key)
                  }
                >
                  {lesson.loading && <div className="button-spinner"></div>}
                  {lesson.buttonText}
                </button>
                <div className="progress-info">
                  <div className="progress-percentage">{lesson.progress}%</div>
                  <div className="progress-circle">
                    <svg className="progress-svg" viewBox="0 0 36 36">
                      <path
                        className="progress-bg"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="progress-fill"
                        strokeDasharray={`${lesson.progress}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
