import React, { useEffect, useState } from "react";
import "./ProfileSettings.css";
import api from "../../../api/client";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { showSuccess, showError } from "../../../utils/toast";

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.me();
        const u = data?.user || data;
        setUser(u);
        setName(u?.name || "");
        setLevel((u?.lessonType || "").toLowerCase());

        // Set language preference from backend if available
        if (u?.languagePreference) {
          changeLanguage(u.languagePreference);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [changeLanguage]);

  if (loading) {
    return (
      <div className="ps-card ps-center">
        <div className="ps-loader"></div>
        <div className="ps-muted">
          {t.loadingProfile || "Loading profile..."}
        </div>
      </div>
    );
  }

  const saveProfile = async () => {
    try {
      setSaving(true);

      // Send only name to backend (language is handled automatically)
      const response = await api.updateProfile({
        name,
        languagePreference: currentLanguage, // Keep current language preference
      });

      if (response.user) {
        // Update local state
        setUser(response.user);

        // Update AuthContext with new user data
        updateUser(response.user);
        showSuccess(t.profileUpdated || "Profile updated successfully.");
      }
    } catch (e) {
      console.error("Failed to update profile", e);
      const msg = e.response?.data?.message || "Failed to update profile";
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(t.allPasswordRequired || "All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(
        t.passwordMismatch || "New password and confirmation do not match"
      );
      return;
    }
    if (newPassword.length < 6) {
      showError(
        t.passwordMinLength || "New password must be at least 6 characters long"
      );
      return;
    }

    try {
      setPwdSaving(true);

      await api.updatePassword({ currentPassword, newPassword });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSuccess(t.passwordUpdated || "Password updated successfully!");
    } catch (e) {
      console.error("Failed to update password", e);
      const msg = e.response?.data?.message || "Failed to update password";
      showError(msg);
    } finally {
      setPwdSaving(false);
    }
  };

  const languages = [
    "English",
    "Hindi",
    "Gujarati",
    "Spanish",
    "French",
    "Punjabi",
    "Telugu",
  ];

  return (
    <div className="ps-layout">
      <div className="ps-card">
        <h3 className="ps-card-title">
          {t.profileInformation || "Profile Information"}
        </h3>
        <p className="ps-card-subtitle">
          {t.profileSubtitle || "Update your name and language preferences"}
        </p>
        <div className="ps-rows">
          <div className="ps-row form">
            <label className="ps-label">{t.nameLabel || "Name"}</label>
            <input
              className="ps-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                // Ensure all keys including backspace work properly
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                // Additional handler to ensure all key events work
                setName(e.target.value);
              }}
              onInput={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder || "Your name"}
              autoComplete="name"
              spellCheck="false"
            />
          </div>
          <div className="ps-row form">
            <label className="ps-label">
              {t.emailLabel || "Email"}{" "}
              <span className="ps-readonly">{t.readOnly || "(Read-only)"}</span>
            </label>
            <input
              className="ps-input ps-disabled"
              value={user?.email || "-"}
              disabled
            />
          </div>
          <div className="ps-row form">
            <label className="ps-label">
              {t.levelLabel || "Level"}{" "}
              <span className="ps-readonly">{t.readOnly || "(Read-only)"}</span>
            </label>
            <input
              className="ps-input ps-disabled"
              value={
                (level || "").charAt(0).toUpperCase() + (level || "").slice(1)
              }
              disabled
            />
          </div>
          <div className="ps-row form">
            <label className="ps-label">{t.languageLabel || "Language"}</label>
            <select
              className="ps-input"
              value={currentLanguage}
              onChange={async (e) => {
                const newLanguage = e.target.value;
                changeLanguage(newLanguage);

                try {
                  // Automatically save language preference to backend
                  const response = await api.updateProfile({
                    name,
                    languagePreference: newLanguage,
                  });

                  if (response.user) {
                    // Update local state and AuthContext
                    setUser(response.user);
                    updateUser(response.user);
                    showSuccess(
                      t.languageUpdated || "Language preference updated."
                    );
                  }
                } catch (error) {
                  console.error("Failed to update language preference:", error);
                  showError(
                    t.languageUpdateFailed ||
                      "Failed to update language preference"
                  );
                  // Revert language change on error
                  changeLanguage(user?.languagePreference || "English");
                }
              }}
            >
              {languages.map((lng) => (
                <option key={lng} value={lng}>
                  {lng}
                </option>
              ))}
            </select>
          </div>
          <div className="ps-actions">
            <button className="ps-btn" onClick={saveProfile} disabled={saving}>
              {saving
                ? t.saving || "Saving..."
                : t.saveChanges || "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="ps-card">
        <h3 className="ps-card-title">
          {t.securitySettings || "Security Settings"}
        </h3>
        <div className="ps-rows">
          <div className="ps-row form">
            <label className="ps-label">
              {t.currentPasswordLabel || "Current Password"}
            </label>
            <input
              className="ps-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t.currentPasswordPlaceholder || "Current password"}
            />
          </div>
          <div className="ps-row form">
            <label className="ps-label">
              {t.newPasswordLabel || "New Password"}
            </label>
            <input
              className="ps-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.newPasswordPlaceholder || "New password"}
            />
          </div>
          <div className="ps-row form">
            <label className="ps-label">
              {t.confirmPasswordLabel || "Confirm Password"}
            </label>
            <input
              className="ps-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmNewPassword || "Confirm new password"}
            />
          </div>
          <div className="ps-actions">
            <button
              className="ps-btn"
              onClick={changePassword}
              disabled={pwdSaving}
            >
              {pwdSaving
                ? t.saving || "Saving..."
                : t.updatePassword || "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
