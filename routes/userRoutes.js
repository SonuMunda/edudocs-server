const express = require("express");
const router = express.Router();
const {
  fetchUserUploads,
  fetchUserDoubts,
  getUserDetailsByUsername,
  getUserDetailsById,
} = require("../controllers/userController");

router.get("/doubts-chat/:userId", fetchUserDoubts);
router.get("/user/id/:id", getUserDetailsById);
router.get("/:username", getUserDetailsByUsername);
router.get("/uploads/:userId", fetchUserUploads);

module.exports = router;
