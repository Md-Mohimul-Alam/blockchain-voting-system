import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token

    // Ensure that the token contains the 'did' property
    if (!decoded.did) {
      return res.status(401).json({ message: "Invalid token, 'did' not found." });
    }

    req.user = decoded;  // Attach decoded token data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

export default authenticateUser;