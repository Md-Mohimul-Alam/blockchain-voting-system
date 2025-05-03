import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Forbidden" });
  }
};

// ✅ This is what you're missing:
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      console.log("🔒 User Role:", req.user.role); // Optional: Debugging role

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }

      next(); // ✅ All good, move forward
    } catch (error) {
      console.error("Authorization Error:", error);
      return res.status(500).json({ error: "Internal server error in authorization." });
    }
  };
};

