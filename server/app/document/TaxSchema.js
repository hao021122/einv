const Joi = require("joi");

/**
 * @param {Object}
 * @param {string} id
 * @param {string} schemaID
 * @param {string} schemaAgencyID
 */
class TaxScheme {
  constructor(id, schemeID, schemeAgencyID) {
    this.id = id ?? 'OTH';
    this.schemeID = schemeID ?? 'UN/ECE 5153';
    this.schemeAgencyID = schemeAgencyID ?? '6';
  }

  toMap() {
    return {
      ID: [
        {
          _: this.id,
          schemeID: this.schemeID,
          schemeAgencyID: this.schemeAgencyID,
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      ID: Joi.array()
        .items(
          Joi.object({
            _: Joi.string().default("OTH"),
            schemeID: Joi.string().default("UN/ECE 5153"),
            schemeAgencyID: Joi.string().default("6"),
          })
        ),
    });
  }
}

module.exports = TaxScheme;
