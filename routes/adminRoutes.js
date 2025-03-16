const router = require("express").Router();

const { getDashboardData, signin, fetchAdminDetails } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddlware");

router.post("/auth/signin", signin);
router.get("/admin-info", authMiddleware, fetchAdminDetails);
router.get("/dashboard", authMiddleware, getDashboardData);

module.exports = router;
