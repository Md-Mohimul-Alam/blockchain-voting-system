import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export default authenticate;
