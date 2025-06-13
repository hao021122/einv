const Joi = require("joi");
const msic = require("../../code/msic.json");
const state = require("../../code/state-code.json");
const country = require("../../code/country-code.json");

// ======================================================
// ********************* Valid Code *********************
// ======================================================
const validMsicCode = msic.map((msic) => msic.Code);
const validMsicDesc = msic.map((msic) => msic.Description);
const validState = state.map((s) => s.Code);
const validCountry = country.map((c) => c.Code);

/**
 * Company Profile
 * cid = co_id
 * cc = co_code
 * cd = co_desc
 * t1 = tin_num
 * brn = register_num
 * sst = sst_num
 * t2 = ttx_num
 * e = email
 * mc = msic_code
 * md = msic_desc
 * a1 = addr_line_1
 * a2 = addr_line_2
 * a3 = addr_line_3
 * pc = post_code
 * c1 = city
 * s = state
 * c2 = country
 * cn = contact_number
 */
const companyProfile = Joi.object({
  cid: Joi.string()
    .guid({ version: ["uuidv4"] })
    .optional()
    .messages({
      "string.guid": "Comapny must be a valid UUID",
      "string.base": "Company must be a string",
    }),
  // co_code
  cc: Joi.string().max(50).required().messages({
    "string.base": "Company Code must be a string",
    "string.max": "Company Code must not exceed 50 characters",
    "any.required": "Company Code is required",
  }),
  cd: Joi.string().max(300).required().messages({
    "string.base": "Company Name nust be a string",
    "string.max": "Company Name must not exceed 300 characters",
    "any.required": "Company Name is required",
  }),
  t1: Joi.string().max(14).required().messages({
    "string.base": "TIN Number must be a string",
    "string.max": "TIN Number must not exceed 14 characters",
    "any.required": "TIN Number is required",
  }),
  brn: Joi.string().max(20).required().messages({
    "string.base": "Business Register Number must be a string",
    "string.max": "Business Register Number must not exceed 20 characters",
    "any.required": "Business Register Number is required",
  }),
  sst: Joi.string().max(30).required().messages({
    "string.base": "SST Register Number must be a string",
    "string.max": "SST Register Number must not exceed 20 characters",
    "any.required": "SST Register Number is required",
  }),
  t2: Joi.string().max(17).required().messages({
    "string.base": "Tourism Tax Register Number must be a string",
    "string.max": "Tourism Tax Register Number must not exceed 20 characters",
    "any.required": "Tourism Tax Register Number is required",
  }),
  e: Joi.string()
    .email({
      allowFullyQualified: true,
      tlds: { allow: true },
    })
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  mc: Joi.string()
    .max(5)
    .valid(...validMsicCode)
    .required()
    .messages({
      "string.base":
        "Malaysia Standard Industrial Classification (MSIC) Codes must be a string",
      "string.max":
        "Malaysia Standard Industrial Classification (MSIC) Codes must not exceed 5 characters",
      "any.only":
        "Invalid Malaysia Standard Industrial Classification (MSIC) Codes",
      "any.required":
        "Malaysia Standard Industrial Classification (MSIC) Codes is required",
    }),
  md: Joi.string()
    .max(300)
    .valid(...validMsicDesc)
    .required()
    .messages({
      "string.base":
        "Malaysia Standard Industrial Classification (MSIC) Codes Description must be a string",
      "string.max":
        "Malaysia Standard Industrial Classification (MSIC) Codes Description must not exceed 300 characters",
      "any.only":
        "Invalid Malaysia Standard Industrial Classification (MSIC) Codes Description",
      "any.required":
        "Malaysia Standard Industrial Classification (MSIC) Codes Description is required",
    }),
  a1: Joi.string().max(150).required().messages({
    "string.base": "Address Line 1 must be a string",
    "string.max": "Address Line 1 must not exceed 150 characters",
    "any.required": "Address Line 1 is required",
  }),
  a2: Joi.string().max(150).optional().messages({
    "string.base": "Address Line 2 must be a string",
    "string.max": "Address Line 2 must not exceed 150 characters",
  }),
  a3: Joi.string().max(150).optional().messages({
    "string.base": "Address Line 3 must be a string",
    "string.max": "Address Line 3 must not exceed 150 characters",
  }),
  pc: Joi.string().max(50).required().messages({
    "string.base": "Post Code must be a string",
    "string.max": "Post Code must not exceed 50 characters",
    "any.required": "Post Code is required",
  }),
  c1: Joi.string().max(50).required().messages({
    "string.base": "City must be a string",
    "string.max": "City must not exceed 50 characters",
    "any.required": "City is required",
  }),
  s: Joi.string()
    .max(50)
    .valid(...validState)
    .required()
    .messages({
      "string.base": "State must be a string",
      "string.max": "State must not exceed 50 characters",
      "any.only": `Invalid State Code, Must be one of: ${validState.join(
        ", "
      )}`,
      "any.required": "State is required",
    }),
  c2: Joi.string()
    .max(3)
    .valid(...validCountry)
    .required()
    .messages({
      "string.base": "Country must be a string",
      "string.max": "Country must not exceed 50 characters",
      "any.only": `Invalid Country Code, Must be one of: ${validCountry.join(
        ", "
      )}`,
      "any.required": "Country is required",
    }),
  cn: Joi.string()
    .pattern(/^\+60\d{8,9}$/)
    .allow("")
    .required()
    .messages({
      "string.pattern.base":
        "Contact number must start with +60 and be 10-11 digits.",
      "any.required": "Contact number is required.",
    }),
});

const companyProfileSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.base": "Code must be a string",
    "any.required": "Code is required",
  }),
  axn: Joi.string().required().messages({
    "string.base": "Action must be a string",
    "any.required": "Action is required",
  }),
  data: Joi.array().items(companyProfile).min(1).required(),
});

module.exports = companyProfileSchema;
