const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-12345";

const authMiddleware = async (req, res, next) => {
  try {
    

    // First try to get token from cookies (preferred method)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      token = req.headers.authorization?.split("Bearer ")[1];
    }

    

    if (!token) {
      
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // If token is expired, try to refresh it
    if (error.name === "TokenExpiredError") {
      try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Token expired and no refresh token" });
        }

        const refreshDecoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-12345"
        );

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: refreshDecoded.userId },
          JWT_SECRET,
          {
            expiresIn: "15m",
          }
        );

        // Set new access token cookie
        const isProduction = process.env.NODE_ENV === "production";
        const isVercel = process.env.VERCEL === "1";
        const isDevelopment = !isProduction && !isVercel;

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: isProduction || isVercel,
          sameSite: isDevelopment ? "none" : "lax",
          maxAge: 15 * 60 * 1000,
          path: "/",
        });

        req.userId = refreshDecoded.userId;
        next();
      } catch (refreshError) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

module.exports = authMiddleware;
