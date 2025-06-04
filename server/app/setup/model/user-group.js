const Joi = require("joi");

/**
 * User Group
 * ug = user_group_id
 * ugd = user_group_desc
 * ia = is_in_use
 * ds = display_seq
 */
const userGroup = Joi.object({
  ug: Joi.string()
    .guid({ version: ["uuidv4"] })
    .allow(null)
    .optional()
    .messages({
      "string.guid": "User Group must be a valid UUID",
      "string.base": "User Group must be a string",
    }),
  ugd: Joi.string().max(255).required().messages({
    "string.base": "User Group Description must be a string",
    "string.max": "User Group Description must not exceed 255 characters",
    "any.required": "User Group Description is required",
  }),
  ia: Joi.number().valid(0, 1).integer().optional().messages({
    "number.base": "Is Active must be a number.",
    "number.integer": "Is Active must be an integer.",
    "any.only": "Is Active must be 0 or 1.",
  }),
  ds: Joi.string().max(6).allow("").optional().messages({
    "string.base": "Display Sequence must be a string",
    "string.max": "Display Sequence must not exceed 6 characters",
  }),
});

const userGroupSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Code must be a string",
    "any.required": "Code is required",
  }),
  axn: Joi.string().required().messages({
    "string.base": "Action must be a string",
    "any.required": "Action is required",
  }),
  data: Joi.array().items(userGroup).min(1).required(),
});

/**
 * User Group Action
 */
const userGroupAction = Joi.object({
  ug: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.guid": "User Group must be a valid UUID",
      "string.base": "User Group must be a string",
      "any.required": "User Group is required",
    }),
  ai: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.base": "Action should be a type of text",
      "string.guid": "Action must be a valid UUIDv4",
      "any.required": "Action is a required",
    }),
});

module.exports = { userGroupSchema };
