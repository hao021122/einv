const Joi = require("joi");

/**
 * User
 * u = user_id
 * ug = user_group_id
 * un = user_name
 * li = login_id
 * e = email
 * p = pwd (frontend use base64 encrypt, backend decrypt and hash)
 * ia = is_active
 */
const user = Joi.object({
  u: Joi.string()
    .guid({ version: ["uuidv4"] })
    .allow(null)
    .messages({
      "string.guid": "User Group must be a valid UUID",
      "string.base": "User Group must be a string",
    }),
  ug: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.guid": "User Group must be a valid UUID",
      "string.base": "User Group must be a string",
      "any.required": "User Group is required",
    }),
  un: Joi.string().max(255).required().messages({
    "string.base": "Username must be a string",
    "string.max": "Username must no exceed 255 characters",
    "any.required": "Username is required",
  }),
  li: Joi.string().max(255).required().messages({
    "string.base": "Login ID must be a string",
    "string.max": "Login ID must no exceed 255 characters",
    "any.required": "Login ID is required",
  }),
  e: Joi.string().max(255).email().required().messages({
    "string.max": "Email must not exceed 255 characters",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  p: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "any.required": "Password is required",
  }),
  ia: Joi.number().valid(0, 1).integer().optional().messages({
    "number.base": "Is Active must be a number.",
    "number.integer": "Is Active must be an integer.",
    "any.only": "Is Active must be 0 or 1.",
  }),
});

const userSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Code must be a string",
    "any.required": "Code is required",
  }),
  axn: Joi.string().required().messages({
    "string.base": "Action must be a string",
    "any.required": "Action is required",
  }),
  data: Joi.array().items(user).min(1).required(),
});

module.exports = userSchema;
