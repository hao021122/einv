const Joi = require("joi");
const TaxScheme = require("./TaxSchema");
const tax = require("../code/tax-type.json");
const validTax = tax.map((t) => t.Code);

/**
 * @param {Object}
 * @param {string} id
 * @param {{id: string, schemaID: string, schemaAgencyID: string}[]} taxSchema
 * @param {string} reason
 */
class TaxCategory {
  constructor(id, taxScheme, reason = null) {
    this.id = id; // e.g., '01'
    this.taxScheme = taxScheme; // instance of TaxScheme
    this.reason = reason;
  }

  toMap() {
    const obj = {
      ID: [{ _: this.id }],
      TaxScheme: [this.taxScheme.toMap()],
    };

    if (this.reason !== null) {
      obj.TaxExemptionReason = [{ _: this.reason }];
    }

    return obj;
  }

  static get outputSchema() {
    return Joi.object({
      ID: Joi.array().items(
        Joi.object({
          _: Joi.string()
            .valid(...validTax)
            .allow("")
            .required()
            .messages({
              "string.base": "Tax Type Code must be a string",
              "any.only": `Invalid Tax Type Code. Must be one of: ${validTax.join(
                ", "
              )}`,
            }),
        })
      ),
      TaxScheme: Joi.array().items(TaxScheme.outputSchema).required(),
      TaxExemptionReason: Joi.array()
        .items(
          Joi.object({
            _: Joi.string().max(300).optional().messages({
              "string.base": "Details of Tax Exemption must be a string",
              "string.max": "Details of Tax Exemption must not exceed 300 characters",
              "string.empty": "Details of Tax Exemption cannot be empty",
              "any.required": "Details of Tax Exemption is required"
            }),
          })
        )
        .optional(),
    });
  }
}

module.exports = TaxCategory;
