const Joi = require("joi");
const currency = require("../code/currency-code.json");
const validCurrency = currency.map((c) => c.Code);

/**
 * @param {number} value
 * @param {string} currencyId
 */
class Amount {
  constructor(value, currencyId) {
    (this.value = value ?? 0), (this.currencyId = currencyId);
  }

  getValue() {
    return this.value;
  }

  getCurrencyID() {
    return this.currencyId;
  }

  toMap() {
    return {
      _: this.value,
      currencyID: this.currencyId,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.number().required().messages({
        "number.base": "Amount must be a number",
        "any.required": "Amount is required",
      }),
      currencyID: Joi.string()
        .max(3)
        .valid(...validCurrency)
        .required()
        .messages({
          "string.base": "Currency ID must be a string",
          "string.max": "Currency ID must not exceed 3 characters",
          "any.only": "Invalid Currency Code",
          "any.required": "Currency ID is required",
        }),
    });
  }
}

module.exports = Amount;
