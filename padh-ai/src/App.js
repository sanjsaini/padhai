import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Welcome from "./components/common/Welcome/Welcome";
import Login from "./components/auth/Login/Login";
import SignUp from "./components/auth/SignUp/SignUp";
import Dashboard from "./pages/Dashboard";
import LessonsPage from "./pages/LessonsPage";
import PlacementTest from "./components/lessons/PlacementTest/PlacementTest";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(180deg, #ff8e32 0%, #ff8e32 30%, #ff8e32 70%, #ff8e32 100%)",
          color: "#2a335c",
          fontSize: "1.2rem",
          fontWeight: "600",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if user is authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(180deg, #ff8e32 0%, #ff8e32 30%, #ff8e32 70%, #ff8e32 100%)",
          color: "#2a335c",
          fontSize: "1.2rem",
          fontWeight: "600",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App component
const AppContent = () => {
  const { user } = useAuth();

  // Global navigation prevention when user is authenticated
  useEffect(() => {
    if (user && window.location.pathname === "/dashboard") {
      // Completely disable browser navigation when on dashboard
      const preventBackNavigation = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Push current state again to prevent navigation
        window.history.pushState(null, null, window.location.href);
        return false;
      };

      // Push initial state to prevent back navigation
      window.history.pushState(null, null, window.location.href);
      window.addEventListener("popstate", preventBackNavigation);

      // Disable keyboard shortcuts
      const preventKeyboardNavigation = (e) => {
        if (
          e.key === "Backspace" ||
          e.key === "Alt+Left" ||
          e.key === "ArrowLeft"
        ) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener("keydown", preventKeyboardNavigation);

      return () => {
        window.removeEventListener("popstate", preventBackNavigation);
        document.removeEventListener("keydown", preventKeyboardNavigation);
      };
    }
  }, [user]);

  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          background: "#ffffff",
          color: "#2a335c",
          border: "2px solid #f3f4f6",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
        progressStyle={{ background: "#ff8e32" }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/placement-test"
          element={
            <ProtectedRoute>
              <PlacementTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons/:section"
          element={
            <ProtectedRoute>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
