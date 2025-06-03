const Joi = require("joi");
const classCode = require("../code/classification-code.json");
const validClassCode = classCode.map((c) => c.Code);
const countryCode = require("../code/country-code.json");
const validCountryCode = countryCode.map((c) => c.Code);

class InvoiceItem {
  constructor(classificationCode, desc, originCountry) {
    (this.classificationCode = classificationCode),
      (this.desc = desc),
      (this.originCountry = originCountry ?? "");
  }

  getClassificationCode() {
    return this.classificationCode;
  }

  getDesc() {
    return this.desc;
  }

  getOriginCountry() {
    return this.originCountry;
  }

  toMap() {
    return {
      CommodityClassification: [
        {
          ItemClassificationCode: [
            {
              _: this.classificationCode,
              listID: "CLASS",
            },
          ],
        },
      ],
      Description: [
        {
          _: this.desc,
        },
      ],
      OriginCountry: [
        {
          IdentificationCode: [
            {
              _: this.originCountry,
            },
          ],
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      CommodityClassification: Joi.array().items(
        Joi.object({
          ItemClassificationCode: Joi.array().items(
            Joi.object({
              _: Joi.string()
                .valid(...validClassCode)
                .required()
                .messages({
                  "any.only": "Invalid Classification Code",
                }),
              listID: Joi.string().default("CLASS"),
            })
          ),
        })
      ),
      Description: Joi.array().items(
        Joi.object({
          _: Joi.string().max(300).allow("").required().messages({
            "string.base": "Description of Product or Service must be a string",
            "string.max":
              "Description of Product or Service must not exceed 300 characters",
            "any.required": "Description of Product or Service is required",
          }),
        })
      ),
      OriginCountry: Joi.array().items(
        Joi.object({
          IdentificationCode: Joi.array().items(
            Joi.object({
              _: Joi.string()
                .max(3)
                .valid(...validCountryCode)
                .allow("")
                .optional()
                .messages({
                  "string.base": "Country Code must be a string",
                  "string.max": "Country Code must not exceed 3 characters",
                  "any.only": "Invalid Country Code",
                }),
            })
          ),
        })
      ),
    });
  }
}

module.exports = InvoiceItem;
