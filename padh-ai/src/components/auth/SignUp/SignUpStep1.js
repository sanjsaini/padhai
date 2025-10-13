import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpStep1.css";
import { useLanguage } from "../../../context/LanguageContext";

const SignUpStep1 = ({ onNext }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    "English",
    "Hindi",
    "Gujarati",
    "Spanish",
    "French",
    "Punjabi",
    "Telugu",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleContinue = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onNext({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = (language) => {
    changeLanguage(language);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="signup-title">{t.signupTitle}</h1>
        {/* Language Selection Dropdown */}
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
        <div className="input-container">
          <input
            type="text"
            name="name"
            placeholder={t.namePlaceholder}
            value={formData.name}
            onChange={handleInputChange}
            className={`signup-input ${errors.name ? "error" : ""}`}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}

          <input
            type="email"
            name="email"
            placeholder={t.emailPlaceholder}
            value={formData.email}
            onChange={handleInputChange}
            className={`signup-input ${errors.email ? "error" : ""}`}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}

          <input
            type="password"
            name="password"
            placeholder={t.passwordPlaceholder}
            value={formData.password}
            onChange={handleInputChange}
            className={`signup-input ${errors.password ? "error" : ""}`}
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder={t.confirmPasswordPlaceholder}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`signup-input ${errors.confirmPassword ? "error" : ""}`}
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <button
          className="signup-button"
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : t.continueButton}
        </button>

        <div className="login-link-container">
          <span className="login-text">Already have an account?</span>
          <button
            className="login-link-button"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep1;
