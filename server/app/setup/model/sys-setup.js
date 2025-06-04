const Joi = require("joi");

/**
 * si = system_id
 * sn = system_name
 * url = url
 * ia = is_in_use
 */
const sysSetup = Joi.object({
  si: Joi.string()
    .guid({ version: ["uuidv4"] })
    .allow(null)
    .optional()
    .messages({
      "string.guid": "User Group must be a valid UUID",
      "string.base": "User Group must be a string",
    }),
  sn: Joi.string().max(255).required().messages({
    "string.base": "System Name must be a string",
    "string.max": "System Name must not exceed 255 characters",
    "any.required": "System Name is required",
  }),
  url: Joi.string().max(255).required().messages({
    "string.base": "URL must be a string",
    "string.max": "URL must not exceed 255 characters",
    "any.required": "URL is required",
  }),
//   dt: Joi.string().valid('ms', 'pg').required().messages({
//     "string.base": "Database Type must be a string.",
//     "any.only": "Database Type must be ms or pg.",
//   }),
  ia: Joi.number().valid(0, 1).integer().optional().messages({
    "number.base": "Is Active must be a number.",
    "number.integer": "Is Active must be an integer.",
    "any.only": "Is Active must be 0 or 1.",
  }),
});

const sysSetupSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Code must be a string",
    "any.required": "Code is required",
  }),
  axn: Joi.string().required().messages({
    "string.base": "Action must be a string",
    "any.required": "Action is required",
  }),
  data: Joi.array().items(sysSetup).min(1).required(),
});

module.exports = sysSetupSchema;