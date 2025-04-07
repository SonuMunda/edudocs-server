const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const { docxToPdf, pdfToDocx } = require("../controllers/documentToolsController");

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext); // Unique filename
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;


router.post("/docx-to-pdf",  upload.single("file"), docxToPdf);
router.post("/pdf-to-docx",  upload.single("file"), pdfToDocx);


module.exports = router;
