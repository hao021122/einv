const Joi = require("joi");

/**
 *
 */
class IssueTime {
  constructor(issueTime) {
    this.issueTime = issueTime;
  }

  getIssueTime() {
    return this.issueTime;
  }

  toMap() {
    return {
      _: this.issueTime,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)Z$/)
        .default(() => {
          const now = new Date().toISOString().slice(11, 19);
          return `${now}Z`;
        })
        .required()
        .messages({
          "string.pattern.base": "Issue Time must be in the format hh:mm:ssZ",
          "any.required": "Issue Time is required",
        }),
    });
  }
}

module.exports = IssueTime;
