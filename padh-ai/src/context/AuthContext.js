import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placementTestStatus, setPlacementTestStatus] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          // Validate session with backend; if cookies missing/expired, clear user
          try {
            await api.me();
            setUser(userData);
          } catch (err) {
            localStorage.removeItem("user");
            setUser(null);
          }

          if (userData.level && userData.placementTestCompleted) {
            setPlacementTestStatus({
              level: userData.level,
              placementTestCompleted: userData.placementTestCompleted,
              placementTestResults: userData.placementTestResults,
            });
          }
        } catch (err) {
          localStorage.removeItem("user");
          setUser(null);
          setPlacementTestStatus(null);
        }
      } else {
        setUser(null);
        setPlacementTestStatus(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signup = async (payload) => {
    const res = await api.signup(payload);
    setUser(res.user);
    // Store user data in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(res.user));
    return res;
  };

  const login = async (payload) => {
    // Handle both API login and user object updates
    if (payload && payload.id && payload.name) {
      // This is a user object update (from placement test completion or user data update)
      setUser(payload);
      // Store user in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(payload));

      // Set language preference from user data
      if (payload.languagePreference) {
        localStorage.setItem("selectedLanguage", payload.languagePreference);
      }

      // Update placement test status if available
      if (payload.lessonType && payload.placementTestCompleted) {
        setPlacementTestStatus({
          level: payload.lessonType,
          placementTestCompleted: payload.placementTestCompleted,
          placementTestResults: payload.placementTestResults,
        });
      }
      return { user: payload };
    } else {
      // This is a regular API login (email/password)
      const res = await api.login(payload);
      setUser(res.user);
      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(res.user));

      // Set language preference from user data
      if (res.user.languagePreference) {
        localStorage.setItem("selectedLanguage", res.user.languagePreference);
      }

      // Check placement test status for API login
      if (res.user.lessonType && res.user.placementTestCompleted) {
        setPlacementTestStatus({
          level: res.user.lessonType,
          placementTestCompleted: res.user.placementTestCompleted,
          placementTestResults: res.user.placementTestResults,
        });
      }
      return res;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await api.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    }

    // Clear local state and storage
    setUser(null);
    setPlacementTestStatus(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userTestData");
    localStorage.removeItem("placementTestResults");
    // Clear any other related data
    sessionStorage.clear();
  };

  const updatePlacementTestStatus = (status) => {
    setPlacementTestStatus(status);
    // Update user object with placement test data
    if (user) {
      const updatedUser = {
        ...user,
        level: status.level,
        placementTestCompleted: status.placementTestCompleted,
        placementTestResults: status.placementTestResults,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    placementTestStatus,
    signup,
    login,
    logout,
    updatePlacementTestStatus,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
