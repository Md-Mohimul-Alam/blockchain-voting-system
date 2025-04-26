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
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role);  // Debugging line to see what role is being passed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to access this resource." });
    }
    next();
  };
};

