const router = require("express").Router();

const upload = require("../config/multerConfig");
const {
  getDashboardData,
  signin,
  fetchAdminDetails,
  bookUpload,
  deleteDocument,
} = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddlware");

router.post("/auth/signin", signin);
router.get("/admin-info", authMiddleware, fetchAdminDetails);
router.get("/dashboard", authMiddleware, getDashboardData);
router.post("/upload", upload.single("cover"), bookUpload);
router.delete("/document/delete/:documentId", authMiddleware, deleteDocument);

module.exports = router;
