const Joi = require("joi");
const AllowanceCharge = require("./AllowanceCharge");

/**
 * @param {string} id
 * @param {object} AllowanceCharge
 */
class Shipment {
  constructor(id, freightAllowanceCharge) {
    (this.id = id), (this.freightAllowanceCharge = freightAllowanceCharge);
  }

  getId() {
    return this.id;
  }

  getFreightALlowanceCharge() {
    return this.freightAllowanceCharge;
  }

  toMap() {
    return {
      ID: [
        {
          _: this.id,
        },
      ],
      FreightAllowanceCharge: [this.freightAllowanceCharge.toMap()],
    };
  }

  static get outputSchema() {
    return Joi.object({
      ID: Joi.array().items(
        Joi.object({
          _: Joi.string().max(300).allow("").optional().messages({
            "string.base": "Shipment ID must be a string",
            "string.max": "Shipment ID must not exceed 300 characters"
          }),
        })
      ),
      FreightAllowanceCharge: Joi.array()
        .items(AllowanceCharge.outputSchema)
        .required(),
    });
  }
}

module.exports = Shipment;
