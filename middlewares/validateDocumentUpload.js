const documentUploadSchema = require("../validations/documentUploadSchema");

const validateDocumentUpload = (req, res, next) => {
  const dataToValidate = {
    ...req.body,
    file: req.file,
  };

  const { error } = documentUploadSchema.validate(dataToValidate);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

module.exports = validateDocumentUpload;
