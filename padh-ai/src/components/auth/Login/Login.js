import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { showSuccess, showError } from "../../../utils/toast";

const Login = () => {
  const { login } = useAuth();
  const { t, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await login(formData);
      const user = response.user;

      // Update language context if user has a language preference
      if (user.languagePreference) {
        changeLanguage(user.languagePreference);
      }

      // Check if user has completed placement test
      if (!user.lessonType || !user.placementTestCompleted) {
        navigate("/placement-test");
      } else {
        showSuccess("Welcome back, you are logged in.");
        navigate("/lessons");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">{t.loginTitle}</h1>

        <div className="input-container">
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder={t.passwordPlaceholder}
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="login-input"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? "Logging in..." : t.loginButtonText}
        </button>

        <div className="signup-link-container">
          <span className="signup-text">
            {t.dontHaveAccount || "Don't have an account?"}
          </span>
          <button
            className="signup-link-button"
            onClick={() => navigate("/signup")}
          >
            {t.signupButton || "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
