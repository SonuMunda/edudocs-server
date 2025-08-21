const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlware");

const {
  signin,
  signup,
  verifyMail,
  updateUser,
  updateUserPassword,
  userDocumentUpload,
  getUserInfo,
  forgetPassword,
  verifyForgetPasswordMail,
  resetPassword,
  googleSignin,
  newGoogleSignin,
} = require("../controllers/authController");
const upload = require("../config/multerConfig");
const validateDocumentUpload = require("../middlewares/validateDocumentUpload");
const validateSignup = require("../middlewares/validateSignup");
const validateToken = require("../middlewares/validateToken");

router.post("/signup", validateSignup, signup);
router.get("/verify", verifyMail);
router.post("/signin", signin);
router.get("/user-info", authMiddleware, getUserInfo);
router.patch("/update-profile", authMiddleware, updateUser);
router.patch("/update-password", authMiddleware, updateUserPassword);

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  validateDocumentUpload,
  userDocumentUpload
);

router.post("/forget-password/:email", forgetPassword);
router.get(
  "/reset-password-verification/:token",
  verifyForgetPasswordMail
);
router.patch("/reset-password", validateToken, resetPassword);
router.post("/google/signin", googleSignin);
router.post("/new/google/signin", newGoogleSignin);

module.exports = router;
