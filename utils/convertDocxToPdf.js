const path = require("path");
const fs = require("fs").promises;
const libre = require("libreoffice-convert");

libre.convertAsync = require("util").promisify(libre.convert);

const convertDocxToPdf = async (file) => {
  try {
    const ext = ".pdf";
    const inputPath = path.join(__dirname, `../uploads/${file.filename}`);
    const outputFilename = file.filename.replace(/\.[^/.]+$/, "") + ext;
    const outputPath = path.join(__dirname, `../uploads/${outputFilename}`);

    const docxBuf = await fs.readFile(inputPath);
    const pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
    
    await fs.writeFile(outputPath, pdfBuf);

    return `/uploads/${outputFilename}`; 
  } catch (error) {
    console.error("Error converting DOCX to PDF:", error);
    return null;
  }
};

module.exports = convertDocxToPdf;
