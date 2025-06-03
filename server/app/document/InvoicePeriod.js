const Joi = require("joi");

/**
 * Billing Period Start Date
 * @param {string} startDate // first of month
 * Billing Period End Date
 * @param {string} endDate // end of month
 * Frequency of Billing
 * @param {string} description // monthly
 */
class InvoicePeriod {
  constructor(startDate, endDate, description) {
    this.startDate = (startDate ?? "").toString();
    this.endDate = (endDate ?? "").toString();
    this.description = (description ?? "").toString();
  }

  getStartDate() {
    return this.startDate;
  }

  getEndDate() {
    return this.endDate;
  }

  getDescription() {
    return this.description;
  }

  toMap() {
    return {
      StartDate: [
        {
          _: this.startDate,
        },
      ],
      EndDate: [
        {
          _: this.endDate,
        },
      ],
      Description: [
        {
          _: this.description,
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      StartDate: Joi.array()
        .items(
          Joi.object({
            _: Joi.string()
              .pattern(/^\d{4}-\d{2}-\d{2}$/)
              .allow(null, "")
              .default("")
              .optional()
              .messages({
                "string.pattern.base":
                  "Billing Period Start Date must be in the format YYYY-MM-DD",
              }),
          })
        )
        .required()
        .messages({
          "any.required": "Invoice Period (Start Date Field) is required",
        }),
      EndDate: Joi.array()
        .items(
          Joi.object({
            _: Joi.string()
              .pattern(/^\d{4}-\d{2}-\d{2}$/)
              .allow(null, "")
              .default("")
              .optional()
              .messages({
                "string.pattern.base":
                  "Billing Period End Date must be in the format YYYY-MM-DD",
              }),
          })
        )
        .required()
        .messages({
          "any.required": "Invoice Period (End Date Field) is required",
        }),
      Description: Joi.array()
        .items(
          Joi.object({
            _: Joi.string()
              .max(50)
              .allow(null, "")
              .optional()
              .messages({
                "sting.base": "Frequency of Billing must be a string",
                "string.max":
                  "Frequency of Billing must not exceed 50 characters",
              }),
          })
        )
        .required()
        .messages({
          "any.required": "Invoice Period (Description Field) is required",
        }),
    });
  }
}

module.exports = InvoicePeriod;
