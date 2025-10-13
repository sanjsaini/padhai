// frontend/src/api/client.js
import axios from "axios";

// Prefer localhost API when running the app on localhost; otherwise use production API
const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser && /localhost|127\.0\.0\.1/.test(window.location.hostname);

// When on localhost: if an explicit env is set, use it; otherwise, if the app
// runs on :3000, default API to :5000/api. If running on another local port,
// fall back to http://localhost:5000/api.
const computeLocalBase = () => {
  if (!isBrowser) return "http://localhost:5000/api";
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const port = window.location.port;
  if (port === "3000") return "http://localhost:5000/api";
  return "http://localhost:5000/api";
};

const baseURL = isLocalhost
  ? computeLocalBase()
  : "https://padh-ai-backend.vercel.app/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // Enable cookies for secure authentication
  timeout: 10000, // Increased timeout to 10 seconds for better reliability
});

// Response interceptor - do NOT auto-redirect on 401
// Let screens decide how to handle unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Legacy functions for backward compatibility (now just manage user data)
export const setToken = (token) => {
  // No longer needed with cookie-based auth, but keeping for compatibility
};

export const getToken = () => {
  // No longer needed with cookie-based auth, but keeping for compatibility
  return null;
};

const clientApi = {
  // Health check
  health: () => api.get("/health").then((res) => res.data),
  // Auth endpoints
  signup: (payload) =>
    api.post("/auth/signup", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data),
  updateProfile: (payload) =>
    api.put("/auth/me", payload).then((res) => res.data),
  updatePassword: (payload) =>
    api.put("/auth/me/password", payload).then((res) => res.data),
  // Test endpoints
  getQuestions: () => api.get("/questions").then((res) => res.data),
  generateTestContent: (payload) =>
    api
      .post("/test-content/generate", payload, { timeout: 60000 })
      .then((res) => res.data), // 1 minute timeout for test generation
  getUserTestContent: () =>
    api.get("/test-content/user").then((res) => res.data),
  submitPlacementTest: (payload) =>
    api.post("/placement-test/submit", payload).then((res) => res.data),
  getPlacementTestStatus: () =>
    api.get("/placement-test/status").then((res) => res.data),
  // Lessons (per-section on-demand)
  generateSectionLessons: (section) =>
    api
      .post(`/lessons/generate/${section}`, {}, { timeout: 120000 })
      .then((res) => res.data),
  getUserLessons: (section) =>
    api.get(`/lessons/section/${section}`).then((res) => res.data),
  updateLessonProgress: (lessonId, progressData) =>
    api
      .put(`/lessons/${lessonId}/progress`, progressData)
      .then((res) => res.data),
  getLessonTest: (lessonId) =>
    api.get(`/lessons/${lessonId}/test`).then((res) => res.data),
  submitLessonTest: (testId, testData) =>
    api
      .post(`/lessons/test/${testId}/submit`, testData)
      .then((res) => res.data),
};

export default clientApi;
