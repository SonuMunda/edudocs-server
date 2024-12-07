const express = require("express");
const router = express.Router();
const {
  signup,
  verifyMail,
  signin,
  getUserDetails,
  updateUser,
  userDocumentUpload,
  fetchUserUploads,
  fetchUserDoubts,
  getUserDetailsByUsername,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddlware");
const upload = require("../config/multerConfig");

router.post("/auth/signup", signup);
router.get("/auth/verify/:id/:token", verifyMail);
router.post("/auth/signin", signin);
router.get("/auth/:id", authMiddleware, getUserDetails);
// router.post("/user/chat/solve-doubt/:userId", authMiddleware, userDoubtSolver);
router.get("/doubts-chat/:userId", fetchUserDoubts);
// router.get("/user/:id", getUserDetailsById);
router.get("/:username", getUserDetailsByUsername);
router.patch("/auth/update/:id", authMiddleware, updateUser);
router.post(
  "/upload/:id",
  authMiddleware,
  upload.single("file"),
  userDocumentUpload
);
router.get("/uploads/:userId", fetchUserUploads);

module.exports = router;
