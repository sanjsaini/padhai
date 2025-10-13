import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";
import { useLanguage } from "../../../context/LanguageContext";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">{t.welcomeTitle}</h1>
        <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
        <div className="button-container">
          <button className="welcome-button" onClick={handleSignUp}>
            {t.signupButton}
          </button>
          <button className="welcome-button" onClick={handleLogin}>
            {t.loginButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
