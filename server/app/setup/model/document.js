const Joi = require("joi");
const classCode = require("../../code/classification-code.json");
const countryCode = require("../../code/country-code.json");
const currencyCode = require("../../code/currency-code.json");
const invCode = require("../../code/e-invoice-type.json");
const msic = require("../../code/msic.json");
const payment = require("../../code/payment-mode.json");
const state = require("../../code/state-code.json");
const tax = require("../../code/tax-type.json");
const uom = require("../../code/uom.json");
const dialCode = require("../../code/dial-code.json");

// ======================================================
// ********************* Valid Code *********************
// ======================================================
const validClassCode = classCode.map((c) => c.Code);
const validCountry = countryCode.map((c) => c.Code);
const validCurrCode = currencyCode.map((cc) => cc.Code);
const validInvCode = invCode.map((inv) => inv.Code);
const validMsicCode = msic.map((msic) => msic.Code);
const validMsicDesc = msic.map((msic) => msic.Description);
const validPayment = payment.map((p) => p.Code);
const validState = state.map((s) => s.Code);
const validTax = tax.map((t) => t.Code);
const validUom = uom.map((u) => u.Code);
const escapedDialCodes = dialCode.map(d =>
  d.dial_code.replace(/\+/g, '\\+')
);

const dialCodePattern = `^(${escapedDialCodes.join('|')})\\d{6,12}$`;
const phoneRegex = new RegExp(dialCodePattern);

const documentSchema = Joi.object({
  id: Joi.string().trim().max(50).required().messages({
    "string.base": "Invoice ID must be a string",
    "string.max": "Invoice ID must not exceed 50 characters",
    "string.empty": "Invoice ID cannot be empty",
    "any.required": "Invoice ID is required",
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .default(() => new Date().toISOString().slice(0, 10))
    .required()
    .messages({
      "string.pattern.base": "Issue Date must be in the format YYYY-MM-DD",
      "string.empty": "Issue Date cannot be empty",
      "any.required": "Issue Date is required",
    }),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)Z$/)
    .default(() => {
      const now = new Date().toISOString().slice(11, 19);
      return `${now}Z`;
    })
    .required()
    .messages({
      "string.pattern.base": "Issue Time must be in the format hh:mm:ssZ",
      "string.empty": "Issue Time cannot be empty",
      "any.required": "Issue Time is required",
    }),
  invType: Joi.object({
    code: Joi.string()
      .max(2)
      .valid(...validInvCode)
      .required()
      .messages({
        "string.base": "Invoice Type Code must be a string",
        "string.max": "Invoice Type Code must not exceed 2 characters",
        "string.empty": "Invoice Type Code cannot be empty",
        "any.only": `Invalid Invoice Type Code. Must be one of: ${validInvCode.join(
          ", "
        )}`,
        "any.required": "Invoice Type Code is required",
      }),
    version: Joi.string().max(5).valid("1.0", "1.1").required().messages({
      "string.base": "Version ID must be a string",
      "string.max": "Version ID must not exceed 5 characters",
      "string.empty": "Version ID cannot be empty",
      "any.only": "Invalid Version ID. Must be one of: 1.0 or 1.1",
      "any.required": "Version ID is required",
    }),
  }).required(),
  currencyCode: Joi.string()
    .max(3)
    .valid(...validCurrCode)
    .required()
    .messages({
      "string.base": "Currency Code must be a string",
      "string.max": "Currency Code must not exceed 3 characters",
      "string.empty": "Currency Code cannot be empty",
      "any.only": "Invalid Currency Code",
      "any.required": "Currency Code is required",
    }),
  period: Joi.object({
    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow("")
      .default(() => {
        const date = new Date();
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        return first.toISOString().slice(0, 10);
      })
      .optional()
      .messages({
        "string.pattern.base": "Start Date must be in the format YYYY-MM-DD",
      }),
    endDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow("")
      .default(() => {
        const date = new Date();
        const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return last.toISOString().slice(0, 10);
      })
      .optional()
      .messages({
        "string.pattern.base": "End Date must be in the format YYYY-MM-DD",
      }),
    desc: Joi.string().max(50).allow("").optional().messages({
      "sting.base": "Frequency of Billing must be a string",
      "string.max": "Frequency of Billing must not exceed 50 characters",
    }),
  }),
  billRefer: Joi.string()
    .trim()
    .max(150)
    .allow("")
    .default("")
    .optional()
    .messages({
      "string.base": "Bill Reference Number must be a string",
      "string.max": "Bill Reference Number must not exceed 150 characters",
    }),
  additionalInfo: Joi.array().items(
    Joi.object({
      id: Joi.string().trim().max(1000).allow("").optional().messages({}),
    })
  ),

  supplier: Joi.object({
    acctId: Joi.string().trim().max(300).allow("").optional().messages({
      "string.base":
        "Authorisation Number for Certified Exporter must be a string",
      "string.max":
        "Authorisation Number for Certified Exporter must not exceed 300 characters",
    }),
    partyIdentification: Joi.array()
      .items(
        Joi.object({
          id: Joi.alternatives().try(
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
                "string.base": "SST Registration Number must be a string",
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
          scheme: Joi.string()
            .valid("NRIC", "PASSPORT", "BRN", "ARMY", "TIN", "SST", "TTX")
            .required()
            .messages({
              "string.base": "Field Type must be a string",
              "string.empty": "Field Type cannot be empty",
              "any.only":
                "Invalid Field Type. Must be one of: NRIC, PASSPORT, BRN, ARMY, TIN, SST, TTX",
              "any.required": "Field Type is required",
            }),
        })
      )
      .length(4)
      .required()
      .messages({
        "array.length": "Exactly 4 party identification entries are required",
        "array.base": "Party Identification must be an array",
        "any.required": "Party Identification is required",
      }),
    msicCode: Joi.object({
      code: Joi.string()
        .valid(...validMsicCode)
        .required()
        .messages({
          "string.base": "Msic Code must be a string",
          "string.empty": "Msic Code cannot be empty",
          "any.only": "Invalid Msic Code.",
          "any.required": "Msic Code is required",
        }),
      name: Joi.string()
        .valid(...validMsicDesc)
        .messages({
          "string.base": "Classification Description must be a string",
          "string.empty": "Msic Code cannot be empty",
          "any.only": "Invalid Classification Description.",
          "any.required": "Msic Code is required",
        }),
    }),
    city: Joi.string().max(50).required().messages({
      "string.base": "City Name must be a string",
      "string.max": "City Name must not exceed 50 characters",
      "string.empty": "City Name cannot be empty",
      "any.required": "City Name is required",
    }),
    postalZone: Joi.string().max(50).allow("").optional().messages({
      "string.base": "Postal Zone must be a string",
      "string.max": "Postal Zone must not exceed 50 characters",
    }),
    countrySubentityCode: Joi.string()
      .max(50)
      .valid(...validState)
      .required()
      .messages({
        "string.base": "State Code must be a string",
        "string.max": "State Code must not exceed 50 characters",
        "string.empty": "State Code cannot be empty",
        "any.only": "Invalid State Code",
      }),
    addressLines: Joi.array().items(
      Joi.string().max(150).allow("").messages({
        "string.base": "Address Line must be a string",
        "string.max": "Address Line must not exceed 150 characters",
      })
    ),
    countryCode: Joi.string()
      .max(3)
      .valid(...validCountry)
      .required()
      .messages({
        "string.base": "Country must be a string",
        "string.max": "Country Code must not exceed 3 characters",
        "string.empty": "Country cannot be empty",
        "any.only": `Invalid Country Code. Must be one of: ${validCountry.join(
          ", "
        )}`,
        "any.required": "Country Code is required",
      }),
    name: Joi.string().max(300).required().messages({
      "string.base": "Registration Name must be a string",
      "string.max": "Registration Name must not exceed 300 characters",
      "string.empty": "Registration Name cannot be empty",
      "any.required": "Registration Name is required",
    }),
    telephone: Joi.string()
      .pattern(phoneRegex)
      .allow("", "NA")
      .required()
      .messages({
        "string.pattern.base":
          "Contact number must start with a valid country code and contain 6-12 digits after the code",
        "any.required": "Contact number is required.",
      }),
    email: Joi.string().email().allow("").optional().messages({
      "string.email": "Please provide a valid email address",
    }),
  }),
  buyer: Joi.object({
    partyIdentification: Joi.array()
      .items(
        Joi.object({
          id: Joi.alternatives().try(
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
                "string.base": "SST Registration Number must be a string",
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
          scheme: Joi.string()
            .valid("NRIC", "PASSPORT", "BRN", "ARMY", "TIN", "SST", "TTX")
            .required()
            .messages({
              "string.base": "Field Type must be a string",
              "string.empty": "Field Type cannot be empty",
              "any.only":
                "Invalid Field Type. Must be one of: NRIC, PASSPORT, BRN, ARMY, TIN, SST, TTX",
              "any.required": "Field Type is required",
            }),
        })
      )
      .length(3)
      .required()
      .messages({
        "array.length": "Exactly 3 party identification entries are required",
        "array.base": "Party Identification must be an array",
        "any.required": "Party Identification is required",
      }),
    city: Joi.string().max(50).required().messages({
      "string.base": "City Name must be a string",
      "string.max": "City Name must not exceed 50 characters",
      "string.empty": "City Name cannot be empty",
      "any.required": "City Name is required",
    }),
    postalZone: Joi.string().max(50).allow("").optional().messages({
      "string.base": "Postal Zone must be a string",
      "string.max": "Postal Zone must not exceed 50 characters",
    }),
    countrySubentityCode: Joi.string()
      .max(50)
      .valid(...validState)
      .required()
      .messages({
        "string.base": "State Code must be a string",
        "string.max": "State Code must not exceed 50 characters",
        "string.empty": "State Code cannot be empty",
        "any.only": "Invalid State Code",
        "any.required": "State Code is required",
      }),
    addressLines: Joi.array().items(
      Joi.string().max(150).allow("").messages({
        "string.base": "Address Line must be a string",
        "string.max": "Address Line must not exceed 150 characters",
      })
    ),
    countryCode: Joi.string()
      .max(3)
      .valid(...validCountry)
      .required()
      .messages({
        "string.base": "Country must be a string",
        "string.max": "Country Code must not exceed 3 characters",
        "string.empty": "Country Code cannot be empty",
        "any.only": "Invalid Country Code",
        "any.required": "Country Code is required",
      }),
    name: Joi.string().max(300).allow("").required().messages({
      "string.base": "Registration Name must be a string",
      "string.max": "Registration Name must not exceed 300 characters",
      "any.required": "Registration Name is required",
    }),
    telephone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        "string.pattern.base":
          "Contact number must start with a valid country code and contain 6-12 digits after the code",
        "string.empty": "Contact Number cannot be empty",
        "any.required": "Contact number is required.",
      }),
    email: Joi.string().email().allow("").optional().messages({
      "string.email": "Please provide a valid email address",
    }),
  }),
  delivery: Joi.object({
    partyIdentification: Joi.array()
      .items(
        Joi.object({
          id: Joi.alternatives().try(
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
                "string.base": "SST Registration Number must be a string",
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
          scheme: Joi.string()
            .valid("NRIC", "PASSPORT", "BRN", "ARMY", "TIN", "SST", "TTX")
            .allow("")
            .required()
            .messages({
              "string.base": "Field Type must be a string",
              "any.only":
                "Invalid Field Type. Must be one of: NRIC, PASSPORT, BRN, ARMY, TIN, SST, TTX",
              "any.required": "Field Type is required",
            }),
        })
      )
      .length(1)
      .required()
      .messages({
        "array.length": "Exactly 1 party identification entries are required",
        "array.base": "Party Identification must be an array",
        "any.required": "Party Identification is required",
      }),
    city: Joi.string().max(50).allow("").optional().messages({
      "string.base": "City Name must be a string",
      "string.max": "City Name must not exceed 50 characters",
      "any.required": "City Name is required",
    }),
    postalZone: Joi.string().max(50).allow("").optional().messages({
      "string.base": "Postal Zone must be a string",
      "string.max": "Postal Zone must not exceed 50 characters",
    }),
    countrySubentityCode: Joi.string()
      .max(50)
      .valid(...validState)
      .allow("")
      .optional()
      .messages({
        "string.base": "State Code must be a string",
        "string.max": "State Code must not exceed 50 characters",
        "any.only": "Invalid State Code",
        "any.required": "State Code is required",
      }),
    addressLines: Joi.array().items(
      Joi.string().max(150).allow("").messages({
        "string.base": "Address Line must be a string",
        "string.max": "Address Line must not exceed 150 characters",
      })
    ),
    countryCode: Joi.string()
      .max(3)
      .valid(...validCountry)
      .allow("")
      .optional()
      .messages({
        "string.base": "Country Code must be a string",
        "string.max": "Country Code must not exceed 3 characters",
        "any.only": "Invalid Country Code",
        "any.required": "Country Code is required",
      }),
    name: Joi.string().max(300).allow("").optional().messages({
      "string.base": "Registration Name must be a string",
      "string.max": "Registration Name must not exceed 300 characters",
    }),
    id: Joi.string().max(300).allow("").optional().messages({
      "string.base": "Shipment ID must be a string",
      "string.max": "Shipment ID must not exceed 300 characters",
    }),
    chargeIndicator: Joi.boolean().optional().messages({
      "boolean.base": "Charge Indicator must be true or false",
      "any.required": "Charge Indicator is required",
    }),
    reason: Joi.string().trim().allow("").max(300).messages({
      "string.base": "Reason must be a string",
      "string.max": "Reason must not exceed 300 characters",
    }),
    amount: Joi.number().allow(0).optional().messages({
      "number.base": "Amount must be a number",
    }),
  }),
  payment: Joi.object({
    code: Joi.string()
      .max(2)
      .valid(...validPayment)
      .allow("")
      .optional()
      .messages({
        "string.base": "Payment Means Code must be a string",
        "string.max": "Payment Means Code must not exceed 2 characters",
        "any.only": `Invalid Payment Means Code. Must be one of: ${validPayment.join(
          ", "
        )}`,
      }),
    account: Joi.string().trim().max(150).allow("").optional().messages({
      "string.base": "Payee Financial Account must be a string",
      "string.max": "Payee Financial Account must not exceed 150 characters",
    }),
    note: Joi.string().trim().max(300).allow("").optional().messages({
      "string.base": "Payment Terms must be a string",
      "string.max": "Payment Terms must not exceed 300 characters",
    }),
    desc: Joi.string().max(150).allow("").optional().messages({
      "string.base": "Prepayment Reference Number must be a string",
      "string.max":
        "Prepayment Reference Number must not exceed 150 characters",
    }),
    amount: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    paidDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .allow("")
      .default(() => new Date().toISOString().slice(0, 10))
      .optional()
      .messages({
        "string.pattern.base": "Paid Date must be in the format YYYY-MM-DD",
      }),
    paidTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)Z$/)
      .default(() => {
        const now = new Date().toISOString().slice(11, 19);
        return `${now}Z`;
      })
      .allow("")
      .optional()
      .messages({
        "string.pattern.base": "Paid Time must be in the format hh:mm:ssZ",
      }),
  }),
  allowanceCharge: Joi.array()
    .items(
      Joi.object({
        chargeIndicator: Joi.boolean().optional().messages({
          "boolean.base": "Charge Indicator must be true or false",
          "any.required": "Charge Indicator is required",
        }),
        reason: Joi.string().trim().allow("").max(300).messages({
          "string.base": "Reason must be a string",
          "string.max": "Reason must not exceed 300 characters",
        }),
        amount: Joi.number().required().messages({
          "number.base": "Amount must be a number",
          "any.required": "Amount is required",
        }),
      })
    )
    .min(1),
  taxTotal: Joi.object({
    taxAmount: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    taxSubtotal: Joi.array().items(
      Joi.object({
        percent: Joi.number().optional().messages({
          "number.base": "Percent must be a number",
        }),
        taxableAmt: Joi.number().required().messages({
          "number.base": "Amount must be a number",
          "any.required": "Amount is required",
        }),
        taxAmount2: Joi.number().required().messages({
          "number.base": "Amount must be a number",
          "any.required": "Amount is required",
        }),
        taxCategory: Joi.string()
          .valid(...validTax)
          .required()
          .messages({
            "string.base": "Tax Type Code must be a string",
            "string.empty": "Tax Type Code cannot be empty",
            "any.only": `Invalid Tax Type Code. Must be one of: ${validTax.join(
              ", "
            )}`,
            "any.required": "Tax Type Code is required",
          }),
      })
    ),
  }),
  legal: Joi.object({
    lea: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    tea: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    tia: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    ata: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    cta: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    pra: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
    pa: Joi.number().required().messages({
      "number.base": "Amount must be a number",
      "any.required": "Amount is required",
    }),
  }),
  invoiceLine: Joi.array().items(
    Joi.object({
      id: Joi.string().required().messages({
        "string.max": "Invoice Line ID must be a string",
        "string.empty": "Invoice Line ID cannot be empty",
        "any.required": "Invoice Line ID is required",
      }),
      quantity: Joi.number().integer().required().messages({
        "number.base": "Quantity must be a number",
        "number.integer": "Quantity must be an integer",
        "any.required": "Quantity is required",
      }),
      unitCode: Joi.string()
        .valid(...validUom)
        .required()
        .messages({
          "string.base": "Unit of Measurement must be a string",
          "string.empty": "Unit of Measurement cannot be empty",
          "any.only": "Invalid Unit of Measurement",
          "any.required": "Unit of Measurement is required",
        }),
      classCode: Joi.string()
        .valid(...validClassCode)
        .required()
        .messages({
          "string.empty": "Classification Code cannot be empty",
          "any.only": "Invalid Classification Code",
          "any.required": "Classification Code is required",
        }),
      desc: Joi.string().required().messages({
        "string.base": "Product or Service Description must be a string",
        "string.empty": "Product or Service Description cannot be empty",
        "any.required": "Product or Service Description is required",
      }),
      itemPriceExtension: Joi.number().required().messages({
        "number.base": "Amount must be a number",
        "any.required": "Amount is required",
      }),
      lineExtensionAmount: Joi.number().required().messages({
        "number.base": "Amount must be a number",
        "any.required": "Amount is required",
      }),
      price: Joi.number().required().messages({
        "number.base": "Amount must be a number",
        "any.required": "Amount is required",
      }),
      allowanceCharge: Joi.array().items(
        Joi.object({
          chargeIndicator: Joi.boolean().optional().messages({
            "boolean.base": "Charge Indicator must be true or false",
            "any.required": "Charge Indicator is required",
          }),
          reason: Joi.string().trim().allow("").max(300).messages({
            "string.base": "Reason must be a string",
            "string.max": "Reason must not exceed 300 characters",
          }),
          mfn: Joi.number().messages({
            "number.base": "Multipler Factor numeric must be a number",
          }),
          amount: Joi.number().required().messages({
            "number.base": "Amount must be a number",
            "any.required": "Amount is required",
          }),
        })
      ),
      taxTotal: Joi.object({
        taxAmount: Joi.number().required().messages({
          "number.base": "Amount must be a number",
          "any.required": "Amount is required",
        }),
        taxSubtotal: Joi.array().items(
          Joi.object({
            taxableAmt: Joi.number().required().messages({
              "number.base": "Amount must be a number",
              "any.required": "Amount is required",
            }),
            taxAmount2: Joi.number().required().messages({
              "number.base": "Amount must be a number",
              "any.required": "Amount is required",
            }),
            percent: Joi.number().optional().messages({
              "number.base": "Percent must be a number",
            }),
            taxCategory: Joi.string()
              .valid(...validTax)
              .required()
              .messages({
                "string.base": "Tax Type Code must be a string",
                "string.empty": "Tax Type Code cannot be empty",
                "any.only": `Invalid Tax Type Code. Must be one of: ${validTax.join(
                  ", "
                )}`,
                "any.required": "Tax Type Code is required",
              }),
            taxDesc: Joi.string().max(300).required().messages({
              "string.base": "Details of Tax Exemption must be a string",
              "string.max":
                "Details of Tax Exemption must not exceed 300 characters",
              "string.empty": "Details of Tax Exemption cannot be empty",
              "any.required": "Details of Tax Exemption is required",
            }),
          })
        ),
      }),
    })
  ),
});

module.exports = documentSchema;
