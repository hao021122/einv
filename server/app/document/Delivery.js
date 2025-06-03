const Joi = require("joi");
const Party = require("./Party");
const Shipment = require("./Shipment");

class DeliveryParty {
  constructor(deliveryParty, shipment) {
    (this.deliveryParty = deliveryParty), (this.shipment = shipment);
  }

  getDeliveryParty() {
    return this.deliveryParty;
  }

  getShipment() {
    return this.shipment;
  }

  toMap() {
    return {
      DeliveryParty: [this.deliveryParty.toMap()],
      Shipment: [this.shipment.toMap()],
    };
  }

  static get outputSchema() {
    return Joi.object({
      DeliveryParty: Joi.array()
        .items(Party.outputSchema)
        .required()
        .messages({
          "any.required": "DeliveryParty is required",
        }),

      Shipment: Joi.array()
        .items(Shipment.outputSchema)
        .required()
        .messages({
          "any.required": "Shipment is required",
        }),
    });
  }
}

module.exports = DeliveryParty;