const Joi = require("joi");

/**
 * @param {string} note
 */
class PaymentTerm {
  constructor(note) {
    this.note = (note ?? "").toString();
  }

  getNote() {
    return this.note;
  }

  toMap() {
    return {
      Note: [
        {
          _: this.note,
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      Note: Joi.array().items(
        Joi.object({
          _: Joi.string().trim().max(300).allow("").optional().messages({
            "string.base": "Payment Terms must be a string",
            "string.max": "Payment Terms must not exceed 300 characters",
          }),
        })
      ),
    });
  }
}

module.exports = PaymentTerm;
