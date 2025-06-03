const Joi = require("joi");
const currency = require("../code/currency-code.json");
const validCurrency = currency.map((c) => c.Code);

/**
 * @param {string} currencyCode
 */
class CurrencyCode {
  constructor(currencyCode) {
    this.currencyCode = currencyCode;
  }

  getCurrencyCode() {
    return this.currencyCode;
  }

  toMap() {
    return {
      _: this.currencyCode,
    };
  }

  static get currencyCodeSchema() {
    return Joi.object({
      _: Joi.string()
        .max(3)
        .valid(...validCurrency)
        .required()
        .messages({
          "string.base": "Currency Code must be a string",
          "string.max": "Currency Code must not exceed 3 characters",
          "any.only": "Invalid Currency Code",
          "any.required": "Currency Code is required",
        }),
    });
  }
}

module.exports = CurrencyCode;
