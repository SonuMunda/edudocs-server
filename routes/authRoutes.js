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
} = require("../controllers/authController");
const upload = require("../config/multerConfig");

router.post("/signup", signup);
router.get("/verify/:id/:token", verifyMail);
router.post("/signin", signin);
router.get("/user-info", authMiddleware, getUserInfo);
router.patch("/update", authMiddleware, updateUser);
router.patch("/update-password", authMiddleware, updateUserPassword);

router.post(
  "/upload/:id",
  authMiddleware,
  upload.single("file"),
  userDocumentUpload
);

router.post("/forget-password/:email", forgetPassword);
router.get("/reset-password-verification/:userId/:token", verifyForgetPasswordMail);
router.patch("/reset-password", authMiddleware, resetPassword);

module.exports = router;
