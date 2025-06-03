const Joi = require("joi");

/**
 * Refer to (https://sdk.myinvois.hasil.gov.my/documents/invoice-v1-0/)
 *
 * Reference Number of Customs Form No.1, 9, etc.
 * Unique identifier assigned on the Declaration of Goods Imported. Multiple reference numbers can be separated by commas (,) without space.
 * AdditionalDocumentReference[1] (ID, DocumentType [exp: CustomsImportForm])
 * @param {string} id
 * @param {string} documentType
 *
 * Free Trade Agreement (FTA) Information [For export only, if applicable]
 * Details, provisions and requirements outlined within a trade agreement between two or more countries.
 * The input of special characters is not allowed, except for dash (-), open bracket (() and closed bracket ()).
 * AdditionalDocumentReference[2] (ID, DocumentType [exp: CustomsImportForm])
 * @param {string} id
 * @param {string} documentType
 * @param {string} documentDescription
 *
 * Reference Number of Customs Form No.2
 * Unique identifier assigned on the Declaration of Goods Exported. Multiple reference numbers can be separated by commas (,) without space.
 * AdditionalDocumentReference[3] (ID, DocumentType [exp: K2])
 * @param {string} id
 * @param {string} documentType
 *
 * Incoterms
 * A set of international trade rules that define the responsibilities of buyers and suppliers.
 * The input of special characters is not allowed.
 * AdditionalDocumentReference[4] (ID [exp: CIF])
 * @param {string} id
 */
class AdditionalDocReference {
  constructor(id, documentType, documentDescription) {
    this.id = (id ?? "").toString();
    this.documentType = (documentType ?? "").toString();
    this.documentDescription = (documentDescription ?? "").toString();
  }

  getId() {
    return this.id;
  }

  getDocumentType() {
    return this.documentType;
  }

  getDocumentDescription() {
    return this.documentDescription;
  }

  toMap() {
    const obj = {
      ID: [
        {
          _: this.id,
        },
      ],
    };

    if (this.documentType) {
      obj.DocumentType = [
        {
          _: this.documentType,
        },
      ];
    }

    if (this.documentDescription) {
      obj.DocumentDescription = [
        {
          _: this.documentDescription,
        },
      ];
    }

    return obj;
  }

  // Reference Number of Customs Form No.1, 9, etc.
  // Reference Number of Customs Form No.2
  // Incoterms
  static get outputSchema() {
    return Joi.object({
      ID: Joi.array().items(
        Joi.object({
          _: Joi.string().trim().max(1000).allow("").optional().messages({
            "string.base": "ID must be a string",
            "string.max": "ID must not exceed 1000 characters",
          }),
        })
      ),
      
    });
  }
}

module.exports = AdditionalDocReference;
