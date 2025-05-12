const Joi = require("joi");

const documentUploadSchema = Joi.object({
  file: Joi.any()
    .meta({ swaggerType: "file" })
    .required()
    .messages({
      "any.required": "File is required",
      "any.empty": "File is required",
    })
    .custom((value, helpers) => {
      if (!value || !value.mimetype || !value.size) {
        return helpers.error("any.invalid", {
          message: "A valid file is required",
        });
      }
      const validFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validFileTypes.includes(value.mimetype)) {
        return helpers.error("any.invalid", {
          message: "Invalid file type. Only PDF, DOC, or DOCX are allowed.",
        });
      }
      const maxSize = 10 * 1024 * 1024;
      if (value.size > maxSize) {
        return helpers.error("any.invalid", {
          message: "File size exceeds the 10MB limit.",
        });
      }
      return value;
    }, "File Validation"),
  title: Joi.string().trim().required().messages({
    "string.empty": "File title is required",
    "any.required": "File title is required",
  }),
  fileType: Joi.string().trim().required().messages({
    "string.empty": "File type is required",
    "any.required": "File type is required",
  }),
  category: Joi.string()
    .trim()
    .valid("assignment", "notes", "practice material", "practical", "other")
    .required()
    .messages({
      "string.empty": "Category is required",
      "any.required": "Category is required",
      "any.only":
        "Category must be one of: assignment, notes, practice material, practical, other",
    }),
  university: Joi.string().trim().required().messages({
    "string.empty": "University is required",
    "any.required": "University is required",
  }),
  course: Joi.string().trim().required().messages({
    "string.empty": "Course is required",
    "any.required": "Course is required",
  }),
  session: Joi.string().trim().required().messages({
    "string.empty": "Session is required",
    "any.required": "Session is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
});

module.exports = documentUploadSchema;
