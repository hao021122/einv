const Joi = require("joi");
const Amount = require("./Amount");

/**
 * 
 */
class LegalMonetaryTotal {
  constructor(
    lineExtensionAmount,
    taxExclusiveAmount,
    taxInclusiveAmount,
    allowanceTotalAmount,
    chargeTotalAmount,
    payableRoundingAmount,
    payableAmount
  ) {
    (this.lineExtensionAmount = lineExtensionAmount),
      (this.taxExclusiveAmount = taxExclusiveAmount),
      (this.taxInclusiveAmount = taxInclusiveAmount),
      (this.allowanceTotalAmount = allowanceTotalAmount),
      (this.chargeTotalAmount = chargeTotalAmount),
      (this.payableRoundingAmount = payableRoundingAmount),
      (this.payableAmount = payableAmount);
  }

  toMap() {
    return {
      LineExtensionAmount: [this.lineExtensionAmount.toMap()],
      TaxExclusiveAmount: [this.taxExclusiveAmount.toMap()],
      TaxInclusiveAmount: [this.taxInclusiveAmount.toMap()],
      AllowanceTotalAmount: [this.allowanceTotalAmount.toMap()],
      ChargeTotalAmount: [this.chargeTotalAmount.toMap()],
      PayableRoundingAmount: [this.payableRoundingAmount.toMap()],
      PayableAmount: [this.payableAmount.toMap()],
    };
  }

  static get outputSchema() {
    return Joi.object({
      LineExtensionAmount: Joi.array().items(Amount.outputSchema).required(),
      TaxExclusiveAmount: Joi.array().items(Amount.outputSchema).required(),
      TaxInclusiveAmount: Joi.array().items(Amount.outputSchema).required(),
      AllowanceTotalAmount: Joi.array().items(Amount.outputSchema).required(),
      ChargeTotalAmount: Joi.array().items(Amount.outputSchema).required(),
      PayableRoundingAmount: Joi.array().items(Amount.outputSchema).required(),
      PayableAmount: Joi.array().items(Amount.outputSchema).required() 
    });
  }
}

module.exports = LegalMonetaryTotal;
