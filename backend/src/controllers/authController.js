const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-12345";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-12345";

// Helper function to set secure cookies
const setSecureCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  const isProdLike = isProduction || isVercel;

  

  // In local dev over HTTP: secure=false, sameSite='lax'
  // In production/hosted over HTTPS with cross-site frontend: secure=true, sameSite='none'
  const cookieBase = {
    httpOnly: true,
    secure: isProdLike,
    sameSite: isProdLike ? "none" : "lax",
    path: "/",
  };

  // Set access token cookie (short-lived)
  res.cookie("accessToken", accessToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set refresh token cookie (long-lived)
  res.cookie("refreshToken", refreshToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Helper function to clear cookies
const clearCookies = (res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

// Signup Controller
const signup = async (req, res) => {
  const { name, email, password, languagePreference } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate languagePreference if provided
    const validLanguages = [
      "English",
      "Hindi",
      "Gujarati",
      "Spanish",
      "French",
      "Punjabi",
      "Telugu",
    ];

    // Use provided languagePreference or default to "English"
    const userLanguagePreference =
      languagePreference && validLanguages.includes(languagePreference)
        ? languagePreference
        : "English";

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      languagePreference: userLanguagePreference,
    });
    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d", // Extend to 7 days since refresh is removed
    });

    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d", // Long-lived refresh token
    });

    // Set secure cookies
    setSecureCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        placementTestCompleted: user.placementTestCompleted,
        lessonType: user.lessonType,
        languagePreference: user.languagePreference,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d", // Extend to 7 days since refresh is removed
    });

    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d", // Long-lived refresh token
    });

    // Set secure cookies
    setSecureCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        placementTestCompleted: user.placementTestCompleted,
        lessonType: user.lessonType,
        languagePreference: user.languagePreference,
        placementTestResults: user.placementTestResults,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh Token Controller
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Set new access token cookie
    const isProduction = process.env.NODE_ENV === "production";
    const isVercel = process.env.VERCEL === "1";
    const isProdLike = isProduction || isVercel;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProdLike,
      sameSite: isProdLike ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        placementTestCompleted: user.placementTestCompleted,
        lessonType: user.lessonType,
        languagePreference: user.languagePreference,
        placementTestResults: user.placementTestResults,
      },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Logout Controller
const logout = async (req, res) => {
  try {
    // Clear cookies
    clearCookies(res);

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile Controller
const getMe = async (req, res) => {
  try {
    
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile Controller
const updateProfile = async (req, res) => {
  try {
    const { name, languagePreference } = req.body;
    const userId = req.userId;

    // Validate input - name and languagePreference can be updated
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    // Validate languagePreference if provided
    const validLanguages = [
      "English",
      "Hindi",
      "Gujarati",
      "Spanish",
      "French",
      "Punjabi",
      "Telugu",
    ];
    if (languagePreference && !validLanguages.includes(languagePreference)) {
      return res.status(400).json({
        message: "Invalid language preference",
      });
    }

    // Build update object
    const updateData = {
      name: name.trim(),
    };

    // Add languagePreference if provided
    if (languagePreference) {
      updateData.languagePreference = languagePreference;
    }

    // Update user
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Password Controller
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  updatePassword,
};
