import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpStep2.css";
import { useLanguage } from "../../../context/LanguageContext";

const SignUpStep2 = ({ onComplete, onBack }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nativeLanguage: "",
    grade: "",
    age: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTakeTest = async () => {
    // Allow test to be taken with any input (or empty fields)
    setSubmitting(true);
    setError("");
    try {
      // Use default values if fields are empty
      const testData = {
        id: Date.now().toString(),
        name: formData.name || "Guest User",
        email: "guest@example.com", // Default email for guest users
        nativeLanguage: formData.nativeLanguage || "English",
        grade: formData.grade || "Grade 5",
        age: formData.age || "10",
      };

      // Store user data in localStorage for the test
      localStorage.setItem("userTestData", JSON.stringify(testData));

      // Navigate to placement test page
      navigate("/placement-test");
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="signup-title">{t.signupTitle}</h1>
        <div className="input-container">
          <input
            type="text"
            name="name"
            placeholder={t.namePlaceholder}
            value={formData.name}
            onChange={handleInputChange}
            className="signup-input"
          />
          <div className="dropdown-container"></div>
          <div className="input-group">
            {/* Grade */}
            <input
              type="text"
              name="grade"
              placeholder={t.gradePlaceholder}
              value={formData.grade}
              onChange={handleInputChange}
              className="signup-input"
            />
            <div className="grade-subtitle">US Standard Grade Level</div>
          </div>
          <input
            type="number"
            name="age"
            placeholder={t.agePlaceholder}
            value={formData.age}
            onChange={handleInputChange}
            className="signup-input"
            min="1"
            max="100"
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <button
          className="signup-button"
          onClick={handleTakeTest}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : t.takeTestButton}
        </button>
      </div>
    </div>
  );
};

export default SignUpStep2;
