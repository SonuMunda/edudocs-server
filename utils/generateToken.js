const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    secretKey,
    { expiresIn: "30d" }
  );
  return token;
};

module.exports = generateToken;
