const Joi = require("joi");

/**
 * @param {string} id
 * @param {string} schemaAgencyName
 */
class AccountID {
  constructor(id, schemeAgencyName) {
    (this.id = (id ?? "").toString()),
      (this.schemeAgencyName = schemeAgencyName ?? 'CertEx');
  }

  getID() {
    return this.id;
  }

  getSchemaAgencyName() {
    return this.schemeAgencyName;
  }

  toMap() {
    return {
      _: this.id,
      schemeAgencyName: this.schemeAgencyName,
    };
  }

  static get outputSchema() {
    return Joi.object({
      _: Joi.string().trim().max(300).allow("").optional().messages({
        "string.base":
          "Authorisation Number for Certified Exporter must be a string",
        "string.max":
          "Authorisation Number for Certified Exporter must not exceed 300 characters",
      }),
      schemeAgencyName: Joi.string().trim().default("CertEx").required(),
    });
  }
}

module.exports = AccountID;
