const convertDocxToPdf = require("../utils/convertDocxToPdf");
const convertPdfToDocx = require("../utils/convertPdfToDocx");

const docxToPdf = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const downloadUrl = await convertDocxToPdf(file);

    return res.status(200).json({ success: true, downloadUrl: downloadUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error converting file" });
  }
};

const pdfToDocx = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const downloadUrl = await convertPdfToDocx(file);

    return res.status(200).json({ success: true, downloadUrl: downloadUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error converting file" });
  }
};



module.exports = { docxToPdf, pdfToDocx };
