const Joi = require("joi");
const codeList = require("../code/e-invoice-type.json");

const validCodes = codeList.map((c) => c.Code);

/**
 * @param {Object}
 * @param {string} invoiceTypeCode
 * @param {string} listVersionID
 */
class InvoiceTypeCode {
  constructor(invoiceTypeCode, listVersionID) {
    this.invoiceTypeCode = invoiceTypeCode;
    this.listVersionID = listVersionID;
  }

  getInvoiceTypeCode() {
    return this.invoiceTypeCode;
  }

  getListVersionID() {
    return this.listVersionID;
  }

  toMap() {
    return {
      _: this.invoiceTypeCode,
      listVersionID: this.listVersionID,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.string()
        .max(2)
        .valid(...validCodes)
        .required()
        .messages({
          "string.base": "Invoice Type Code must be a string",
          "string.max": "Invoice Type Code must not exceed 2 characters",
          "any.only": `Invalid Invoice Type Code. Must be one of: ${validCodes.join(
            ", "
          )}`,
          "any.required": "Invoice Type Code is required",
        }),
      listVersionID: Joi.string().max(5).default("1.0").required().messages({
        "string.base": "e-Invoice Version must be a string",
        "string.max": "e-Invoice Version must not exceed 5 characters",
        "any.required": "e-Invoice Version is required",
      }),
    });
  }
}

module.exports = InvoiceTypeCode;
