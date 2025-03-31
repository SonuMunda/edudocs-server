const express = require("express");
const router = express.Router();
const { fetchLeaderboard } = require("../controllers/leaderboardController");

router.get("/", fetchLeaderboard);

module.exports = router;
