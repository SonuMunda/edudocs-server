const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req?.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.SECRET_KEY);
    req.userId = isVerified.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
