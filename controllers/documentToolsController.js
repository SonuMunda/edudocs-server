const convertDocxToPdf = require("../utils/convertDocxToPdf");

const docxToPdf = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfUrl = await convertDocxToPdf(file);
    return res.status(200).json({ success: true, pdfUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error converting file" });
  }
};

module.exports = { docxToPdf };
