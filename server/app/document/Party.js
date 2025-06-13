const Joi = require("joi");
const msic = require("../code/msic.json");
const validMsicCode = msic.map((c) => c.Code);
const validMsicName = msic.map((c) => c.Description);

const state = require("../code/state-code.json");
const validState = state.map((c) => c.Code);
const country = require("../code/country-code.json");
const validCountry = country.map((c) => c.Code);
const dialCode = require("../code/dial-code.json");
const escapedDialCodes = dialCode.map(d =>
  d.dial_code.replace(/\+/g, '\\+')
);

const dialCodePattern = `^(${escapedDialCodes.join('|')})\\d{6,12}$`;
const phoneRegex = new RegExp(dialCodePattern);

/**
 * @param {Object} params
 * @param {{code: string, name: string}} msicCode
 * @param {{id: string, schemaID: string}[]} partyIdentification
 * @param {string[]} addressLines
 * @param {string} city
 * @param {string} postalZone
 * @param {string} countrySubentityCode
 * @param {string} countryCode
 * @param {string} name
 * @param {string} telephone
 * @param {string} email
 */
class Party {
  constructor({
    msicCode,
    partyIdentification = [],
    addressLines,
    city,
    postalZone,
    countrySubentityCode,
    countryCode,
    name,
    telephone,
    email,
  }) {
    this.msicCode = msicCode;
    this.partyIdentification = partyIdentification; // Array of { id, schemeID }
    this.addressLines = addressLines; // Array of strings
    this.city = city;
    this.postalZone = postalZone;
    this.countrySubentityCode = countrySubentityCode;
    this.countryCode = countryCode;
    this.name = name;
    this.telephone = telephone;
    this.email = email;
  }

  toMap() {
    const obj = {};

    if (this.msicCode) {
      obj.IndustryClassificationCode = [
        {
          _: this.msicCode.code,
          name: this.msicCode.name,
        },
      ];
    }

    if (this.partyIdentification && this.partyIdentification.length > 0) {
      obj.PartyIdentification = this.partyIdentification.map((id) => ({
        ID: [
          {
            _: id.id ?? "",
            schemeID: id.scheme,
          },
        ],
      }));
    }

    if (
      this.addressLines &&
      this.addressLines.length > 0 &&
      typeof this.city === "string" &&
      typeof this.postalZone === "string" &&
      typeof this.countrySubentityCode === "string" &&
      typeof this.countryCode === "string"
    ) {
      obj.PostalAddress = [
        {
          CityName: [{ _: this.city }],
          PostalZone: [{ _: this.postalZone }],
          CountrySubentityCode: [{ _: this.countrySubentityCode }],
          AddressLine: this.addressLines.map((line) => ({
            Line: [{ _: line }],
          })),
          Country: [
            {
              IdentificationCode: [
                {
                  _: this.countryCode,
                  listID: "ISO3166-1",
                  listAgencyID: "6",
                },
              ],
            },
          ],
        },
      ];
    }

    if (typeof this.name === "string") {
      obj.PartyLegalEntity = [
        {
          RegistrationName: [{ _: this.name }],
        },
      ];
    }

    if (typeof this.telephone === "string" && typeof this.email === "string") {
      obj.Contact = [
        {
          Telephone: [{ _: this.telephone }],
          ElectronicMail: [{ _: this.email }],
        },
      ];
    }

    return obj;
  }

  static get outputSchema() {
    return Joi.object({
      IndustryClassificationCode: Joi.array().items(
        Joi.object({
          _: Joi.string()
            .valid(...validMsicCode)
            .messages({
              "string.base": "Classification Code must be a string",
              "any.only": "Invalid Classification Code.",
            }),
          name: Joi.string()
            .valid(...validMsicName)
            .messages({
              "string.base": "Classification Description must be a string",
              "any.only": "Invalid Classification Description.",
            }),
        })
      ),

      PartyIdentification: Joi.array()
        .items(
          Joi.object({
            ID: Joi.array()
              .items(
                Joi.object({
                  _: Joi.alternatives().try(
                    Joi.string().allow("", "NA"),
                    Joi.alternatives().conditional("schemeID", {
                      is: "BRN",
                      then: Joi.string().max(20).required().messages({
                        "string.base":
                          "Registration / Identification Number / Passport Number must be a string",
                        "string.max":
                          "Registration / Identification Number / Passport Number must not exceed 20 characters",
                      }),
                      is: "SST",
                      then: Joi.string().max(35).required().messages({
                        "string.base":
                          "SST Registration Number must be a string",
                        "string.max":
                          "SST Registration Number must not exceed 35 characters",
                      }),
                      is: "TTX",
                      then: Joi.string().max(17).required().messages({
                        "string.base":
                          "Tourism Tax Registration Number must be a string",
                        "string.max":
                          "Tourism Tax Registration Number must not exceed 17 characters",
                      }),
                      otherwise: Joi.string().max(12).required().messages({
                        "string.base":
                          "Registration / Identification Number / Passport Number must be a string",
                        "string.max":
                          "Registration / Identification Number / Passport Number must not exceed 12 characters",
                      }),
                    })
                  ),
                  schemeID: Joi.string()
                    .valid(
                      "NRIC",
                      "PASSPORT",
                      "BRN",
                      "ARMY",
                      "TIN",
                      "SST",
                      "TTX",
                      ""
                    )
                    .required()
                    .messages({
                      "string.base": "Field Type must be a string",
                      "any.only":
                        "Invalid Field Type. Must be one of: NRIC, PASSPORT, BRN, ARMY, TIN, SST, TTX",
                      "any.required": "Field Type is required",
                    }),
                })
              )
              .required(),
          })
        )
        .required(),

      PostalAddress: Joi.array()
        .items(
          Joi.object({
            CityName: Joi.array()
              .items(
                Joi.object({
                  _: Joi.string().max(50).allow("").required().messages({
                    "string.base": "City Name must be a string",
                    "string.max": "City Name must not exceed 50 characters",
                    "any.required": "City Name is required",
                  }),
                })
              )
              .required(),
            PostalZone: Joi.array()
              .items(
                Joi.object({
                  _: Joi.string().max(50).allow("").optional().messages({
                    "string.base": "Postal Zone must be a string",
                    "string.max": "Postal Zone must not exceed 50 characters",
                  }),
                })
              )
              .required(),
            CountrySubentityCode: Joi.array()
              .items(
                Joi.object({
                  _: Joi.string()
                    .valid(...validState)
                    .allow("")
                    .required()
                    .messages({
                      "string.base": "State must be a string",
                      "any.only": "Invalid State Code",
                      "any.required": "State Code is required"
                    }),
                })
              )
              .required(),
            AddressLine: Joi.array()
              .items(
                Joi.object({
                  Line: Joi.array()
                    .items(
                      Joi.object({
                        _: Joi.string().max(150).allow("").messages({
                          "string.base": "Address Line must be a string",
                          "string.max":
                            "Address Line must not exceed 150 characters",
                        }),
                      })
                    )
                    .required(),
                })
              )
              .min(1)
              .required(),
            Country: Joi.array()
              .items(
                Joi.object({
                  IdentificationCode: Joi.array()
                    .items(
                      Joi.object({
                        _: Joi.string()
                          .valid(...validCountry)
                          .allow("")
                          .required()
                          .messages({
                            "string.base": "Country must be a string",
                            "any.only": "Invalid Country Code",
                          }),
                        listID: Joi.string().valid("ISO3166-1").required(),
                        listAgencyID: Joi.string().valid("6").required(),
                      })
                    )
                    .required(),
                })
              )
              .required(),
          })
        )
        .required(),

      PartyLegalEntity: Joi.array()
        .items(
          Joi.object({
            RegistrationName: Joi.array()
              .items(
                Joi.object({
                  _: Joi.string().max(300).allow("").required().messages({
                    "string.base": "Registration Name must be a string",
                    "string.max":
                      "Registration Name must not exceed 300 characters",
                    "any.required": "Registration Name is required",
                  }),
                })
              )
              .required(),
          })
        )
        .required(),

      Contact: Joi.array().items(
        Joi.object({
          Telephone: Joi.array().items(
            Joi.object({
              _: Joi.string()
                .pattern(phoneRegex)
                .allow("")
                .optional()
                .messages({
                  "string.pattern.base":
                    "Contact number must start with a valid country code and contain 6-12 digits after the code",
                  "any.required": "Contact number is required.",
                }),
            })
          ),
          ElectronicMail: Joi.array().items(
            Joi.object({
              _: Joi.string().email().allow("").optional().messages({
                "string.email": "Please provide a valid email address",
              }),
            })
          ),
        })
      ),
    });
  }
}

module.exports = Party;
