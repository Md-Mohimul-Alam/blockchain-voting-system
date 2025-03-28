// authenticateAdmin.js (middleware)
import jwt from 'jsonwebtoken';

const authenticateAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Ensure the decoded role is 'admin'
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    req.user = decoded; // Attach decoded user info to request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export default authenticateAdmin;
