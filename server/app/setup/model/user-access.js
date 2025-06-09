const Joi = require("joi");

const userAccess = Joi.object({
  sid: Joi.string()
    .guid({ version: ["uuidv4"] })
    .allow(null)
    .optional()
    .messages({
      "string.guid": "Session ID must be a valid UUID",
      "string.base": "Session ID must be a string",
    }),
  li: Joi.string().max(255).required().messages({
    "string.base": "Login ID must be a string",
    "string.max": "Login ID must no exceed 255 characters",
    "any.required": "Login ID is required",
  }),
  p: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "any.required": "Password is required",
  }),
});

const userAccessSchema = Joi.object({
   code: Joi.string().required().messages({
      "string.base": "Code must be a string",
      "any.required": "Code is required",
    }),
    axn: Joi.string().required().messages({
      "string.base": "Action must be a string",
      "any.required": "Action is required",
    }),
    data: Joi.array().items(userAccess).min(1).required(),
});

module.exports = userAccessSchema;
