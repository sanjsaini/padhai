const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateProfile);
router.put("/me/password", authMiddleware, authController.updatePassword);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
