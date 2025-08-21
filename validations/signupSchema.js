const Joi = require("joi");

const nameRegex = /^[a-zA-Z]+$/;

const userValidationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .required()
    .pattern(nameRegex)
    .min(3)
    .max(20)
    .messages({
      "string.empty": "First name is required",
      "string.pattern.base": "First name must contain alphabets only",
      "string.min": "First name is too short (min 3 characters)",
      "string.max": "First name is too long (max 20 characters)",
    }),

  lastName: Joi.string()
    .trim()
    .required()
    .pattern(nameRegex)
    .min(3)
    .max(20)
    .messages({
      "string.empty": "Last name is required",
      "string.pattern.base": "Last name must contain alphabets only",
      "string.min": "Last name is too short (min 3 characters)",
      "string.max": "Last name is too long (max 20 characters)",
    }),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  password: Joi.string()
    .trim()
    .required()
    .min(8)
    .pattern(/[0-9]/)
    .pattern(/[a-z]/)
    .pattern(/[A-Z]/)
    .pattern(/[^\w]/)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character",
    }),
});

module.exports = userValidationSchema;
