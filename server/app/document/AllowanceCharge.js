const Joi = require("joi");
const Amount = require("./Amount");

/**
 * @param {boolean} chargeIndicator
 * @param {string} reason
 * @param {object} amount
 * @param {number} multiplierFactorNumeric
 */
class AllowanceCharge {
  constructor(chargeIndicator, reason, amount, multiplierFactorNumeric = null) {
    (this.chargeIndicator = chargeIndicator),
      (this.reason = reason ?? ""),
      (this.amount = amount),
      (this.multiplierFactorNumeric = multiplierFactorNumeric ?? null);
  }

  getChargeIndicator() {
    return this.chargeIndicator;
  }

  getReason() {
    return this.reason;
  }

  getAmount() {
    return this.amount;
  }

  getMultiplierFactorNumeric() {
    return this.multiplierFactorNumeric;
  }

  toMap() {
    const obj = {};

    if (this.chargeIndicator !== undefined) {
      obj.ChargeIndicator = [
        {
          _: this.chargeIndicator,
        },
      ];
    }

    if (typeof this.reason === "string") {
      obj.AllowanceChargeReason = [
        {
          _: this.reason,
        },
      ];
    }

    if (
      this.multiplierFactorNumeric !== null &&
      this.multiplierFactorNumeric !== undefined
    ) {
      obj.MultiplierFactorNumeric = [
        {
          _: this.multiplierFactorNumeric,
        },
      ];
    }

    if (this.amount) {
      obj.Amount = [this.amount.toMap()];
    }

    return obj;
  }

  static get outputSchema() {
    return Joi.object({
      ChargeIndicator: Joi.array().items(
        Joi.object({
          _: Joi.boolean().optional().messages({
            "boolean.base": "Charge Indicator must be true or false",
            "any.required": "Charge Indicator is required",
          }),
        })
      ),
      AllowanceChargeReason: Joi.array().items(
        Joi.object({
          _: Joi.string().trim().allow("").max(300).messages({
            "string.base": "Reason must be a string",
            "string.max": "Reason must not exceed 300 characters",
          }),
        })
      ),
      MultiplierFactorNumeric: Joi.array().items(
        Joi.object({
          _: Joi.number().messages({
            "number.base": "Multipler Factor numeric must be a number",
          }),
        })
      ),
      Amount: Joi.array().items(Amount.outputSchema).required().messages({
        "any.required": "Amount is required",
      }),
    });
  }
}

module.exports = AllowanceCharge;
