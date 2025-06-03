const Joi = require("joi");

/**
 * @param {string} id
 */
class InvoiceID {
  constructor(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  toMap() {
    return {
      _: this.id,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.string().trim().max(50).required().messages({
        "string.base": "Invoice ID must be a string",
        "string.max": "Invoice ID must not exceed 50 characters",
        "any.required": "Invoice ID is required",
      }),
    });
  }
}

module.exports = InvoiceID;
