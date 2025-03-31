const { HttpStatusCode } = require("axios");
const User = require("../models/userModel");

const fetchLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res
      .status(HttpStatusCode.Ok)
      .json({ users: users, message: "Leaderboard fetched successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal server error", error });
  }
};

module.exports = { fetchLeaderboard };
