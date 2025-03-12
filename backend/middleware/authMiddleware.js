import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 Middleware: Verify JWT Token (Protect Routes)
 */
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ success: false, error: "❌ Access Denied. No token provided." });
    }

    // ✅ Extract the token without "Bearer "
    const jwtToken = token.replace("Bearer ", "");

    // ✅ Verify JWT Token
    const verified = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to request

    next();
  } catch (error) {
    console.error("❌ JWT Verification Failed:", error);
    res.status(403).json({ success: false, error: "❌ Invalid Token." });
  }
};

/**
 * 🔹 Middleware: Check if User is Admin
 */
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ did: req.user.did });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, error: "❌ Permission Denied. Admin access required." });
    }

    next();
  } catch (error) {
    console.error("❌ Admin Check Failed:", error);
    res.status(500).json({ success: false, error: "❌ Server Error." });
  }
};
