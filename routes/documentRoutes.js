const express = require("express");
const router = express.Router();

const {
  fetchAllDocuments,
  fetchFileDetailsById,
  toggleLike,
  toggleVote,
} = require("../controllers/documentController");

router.get("/", fetchAllDocuments);
router.get("/document/:fileId", fetchFileDetailsById);
router.patch("/document/like/:uploadId/:userId", toggleLike);
router.patch("/document/vote/:uploadId/:userId", toggleVote);

module.exports = router;
