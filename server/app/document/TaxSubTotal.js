const Joi = require("joi");
const Amount = require("./Amount");
const TaxCategory = require("./TaxCategory");

/**
 *
 */
class TaxSubtotal {
  constructor(taxableAmount, taxAmount, taxCategory, percent = null) {
    this.taxableAmount = taxableAmount; // Amount
    this.taxAmount = taxAmount; // Amount
    this.taxCategory = taxCategory; // TaxCategory
    this.percent = percent;
  }

  toMap() {
    const obj = {
      TaxableAmount: [this.taxableAmount.toMap()],
      TaxAmount: [this.taxAmount.toMap()],
      TaxCategory: [this.taxCategory.toMap()],
    };

    if (this.percent !== null) {
      obj.Percent = [
        {
          _: this.percent,
        },
      ];
    }

    return obj;
  }

  static get outputSchema() {
    return Joi.object({
      TaxableAmount: Joi.array().items(Amount.outputSchema).required(),
      TaxAmount: Joi.array().items(Amount.outputSchema).required(),
      TaxCategory: Joi.array().items(TaxCategory.outputSchema).required(),
      Percent: Joi.array()
        .items(
          Joi.object({
            _: Joi.number().optional().messages({
              "number.base": "Percent must be a number"
            }),
          })
        )
        .optional(),
    });
  }
}

module.exports = TaxSubtotal;
