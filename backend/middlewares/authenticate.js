import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    req.user = decoded; // Attach decoded user info to the request
    next(); // Pass control to the next middleware or route handler
  });
};

export default authenticateUser;
