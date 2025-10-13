// Load environment variables first
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("FRONTEND_URLS:", process.env.FRONTEND_URLS);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {});
