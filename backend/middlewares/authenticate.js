// authenticate.js (middleware)
import jwt from 'jsonwebtoken';

const authenticate = (requiredRole = "user") => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Check if the decoded role matches the required role
      if (decoded.role !== requiredRole && decoded.role !== "admin") {
        return res.status(403).json({ error: `Access denied. ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} privileges required.` });
      }

      req.user = decoded; // Attach decoded user info to request object
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      return res.status(400).json({ error: "Invalid token." });
    }
  };
};

export default authenticate;
