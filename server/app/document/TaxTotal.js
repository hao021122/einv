const Joi = require("joi");
const Amount = require("./Amount");
const TaxSubTotal = require("./TaxSubTotal");

/**
 * @param {object} taxAmount
 * @param {Array} taxSubtotals
 */
class TaxTotal {
  constructor(taxAmount, taxSubtotals) {
    this.taxAmount = taxAmount; // Amount
    this.taxSubtotals = taxSubtotals; // array of TaxSubtotal
  }

  toMap() {
  return {
    TaxAmount: [this.taxAmount.toMap()],
    TaxSubtotal: this.taxSubtotals.map(sub => sub.toMap()),
  };
}


  static get outputSchema() {
    return Joi.object({
      TaxAmount: Joi.array().items(Amount.outputSchema).required(),
      TaxSubtotal: Joi.array().items(TaxSubTotal.outputSchema).required(),
    });
  }
}

module.exports = TaxTotal;

// example usage:
// const Amount = require('./amount');
// const TaxScheme = require('./taxScheme');
// const TaxCategory = require('./taxCategory');
// const TaxSubtotal = require('./taxSubtotal');
// const TaxTotal = require('./taxTotal');

// const taxAmount = new Amount(87.63, "MYR");
// const taxableAmount = new Amount(87.63, "MYR");

// const scheme = new TaxScheme("OTH", "UN/ECE 5153", "6");
// const category = new TaxCategory("01", scheme);
// const subtotal = new TaxSubtotal(taxableAmount, taxAmount, category);

// const total = new TaxTotal(taxAmount, [subtotal]);

// console.log(JSON.stringify({ TaxTotal: [total.toMap()] }, null, 2));
