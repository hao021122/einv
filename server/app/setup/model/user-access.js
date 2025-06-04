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
});

const userAccessSchema = Joi.object({});

module.exports = userAccessSchema;
