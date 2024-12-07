const express = require("express");
const router = express.Router();

const {
  fetchAllDocuments,
  fetchFileDetailsById,
  addLike,
  addVote,
} = require("../controllers/documentController");

router.get("/", fetchAllDocuments);
router.get("/document/:fileId", fetchFileDetailsById);
router.patch("/document/like/:uploadId/:userId", addLike);
router.patch("/document/vote/:uploadId", addVote);

module.exports = router;
