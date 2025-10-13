const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const lessonRoutes = require("./routes/lessonRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

console.log("FRONTEND_URLS", process.env.FRONTEND_URLS);
console.log("FRONTEND_URL", process.env.FRONTEND_URL);

// CORS: support multiple frontend origins via FRONTEND_URLS (comma-separated)
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Configure CORS with proper options
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // For development, also allow localhost with any port
      if (origin && origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);
app.use("/api/lessons", lessonRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
