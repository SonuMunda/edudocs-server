const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.SECRET_KEY);
    const userData = await User.findById(isVerified.userId).select("-password");

    if (!userData) {
      return res.status(401).json({ message: "Unauthorized user!!" });
    }

    req.user = userData;
    req.token = token;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
