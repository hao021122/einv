const Joi = require("joi");

/**
 * @param {date} issueDate
 */
class IssueDate {
  constructor(issueDate) {
    this.issueDate = (issueDate ?? "").toString();
  }

  getIssueDate() {
    return this.issueDate;
  }

  toMap() {
    return {
      _: this.issueDate,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .default(() => new Date().toISOString().slice(0, 10))
        .required()
        .messages({
          "string.pattern.base": "Issue Date must be in the format YYYY-MM-DD",
          "any.required": "Issue Date is required",
        }),
    });
  }
}

module.exports = IssueDate;
