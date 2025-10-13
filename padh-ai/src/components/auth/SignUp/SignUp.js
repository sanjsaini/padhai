import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";
import "./SignUp.css";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { showSuccess, showError } from "../../../utils/toast";

const SignUp = () => {
  const { signup } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleStep1Complete = async (data) => {
    try {
      const response = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        languagePreference: currentLanguage,
      });

      // Store user data for placement test
      localStorage.setItem("userTestData", JSON.stringify(response.user));

      setFormData({ ...formData, ...data });
      showSuccess(
        "Account created successfully. Let's take a quick placement test!"
      );

      // Navigate to placement test route instead of changing step
      navigate("/placement-test");
    } catch (err) {
      console.error("Signup error:", err);
      showError(
        err.response?.data?.message ||
          err.message ||
          "Signup failed. Please try again."
      );
    }
  };

  const handleStep2Complete = async (data) => {
    // Step 2 is skipped as per your original logic, but included for completeness
    const payload = {
      name: data.name,
      email: formData.email,
      password: formData.password,
      languagePreference: currentLanguage,
    };
    await signup(payload);
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <SignUpStep1 onNext={handleStep1Complete} />;
      case 2:
        return (
          <SignUpStep2 onComplete={handleStep2Complete} onBack={handleBack} />
        );
      default:
        return <SignUpStep1 onNext={handleStep1Complete} />;
    }
  };

  return <div className="signup-flow">{renderCurrentStep()}</div>;
};

export default SignUp;
