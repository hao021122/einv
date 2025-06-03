const Joi = require("joi");
const AllowanceCharge = require("./AllowanceCharge");
const uom = require("../code/uom.json");
const Amount = require("./Amount");
const TaxTotal = require("./TaxTotal");
const InvoiceItem = require("./InvoiceItem");
const validUom = uom.map((c) => c.Code);

class InvoiceLine {
  constructor(
    allowanceCharge,
    id,
    quantity,
    unitCode,
    item,
    itemPriceExtension,
    lineExtensionAmount,
    price,
    taxTotal
  ) {
    (this.allowanceCharge = allowanceCharge),
      (this.id = id),
      (this.quantity = quantity),
      (this.unitCode = unitCode),
      (this.item = item),
      (this.itemPriceExtension = itemPriceExtension),
      (this.lineExtensionAmount = lineExtensionAmount),
      (this.price = price),
      (this.taxTotal = taxTotal);
  }

  toMap() {
    return {
      AllowanceCharge: this.allowanceCharge.map((ac) => ac.toMap()),
      ID: [
        {
          _: this.id,
        },
      ],
      InvoicedQuantity: [
        {
          _: this.quantity,
          unitCode: this.unitCode, // hotel, DAY; other: XUN
        },
      ],
      Item: [this.item.toMap()],
      ItemPriceExtension: [
        {
          Amount: [this.itemPriceExtension.toMap()],
        },
      ],
      LineExtensionAmount: [this.lineExtensionAmount.toMap()],
      Price: [
        {
          PriceAmount: [this.price.toMap()],
        },
      ],
      TaxTotal: [this.taxTotal.toMap()],
    };
  }

  static get outputSchema() {
    return Joi.object({
      AllowanceCharge: Joi.array()
        .items(AllowanceCharge.outputSchema),
      ID: Joi.array().items(
        Joi.object({
          _: Joi.string().required().messages({
            "string.base": "ID must be a string",
            "any.required": "ID is required",
          }),
        })
      ),
      InvoicedQuantity: Joi.array().items(
        Joi.object({
          _: Joi.number().integer().required().messages({
            "number.base": "Quantity must be a number",
            "number.integer": "Quantity must be an integer",
            "any.required": "Quantity is required",
          }),
          unitCode: Joi.string()
            .valid(...validUom)
            .required()
            .messages({
              "string.base": "Unit of Measurement must be a string",
              "any.only": "Invalid Unit of Measurement",
              "any.required": "Unit of Measurement is required",
            }),
        })
      ),
      Item: Joi.array().items(InvoiceItem.outputSchema),
      ItemPriceExtension: Joi.array().items(
        Joi.object({
          Amount: Joi.array().items(Amount.outputSchema).required(),
        })
      ),
      LineExtensionAmount: Joi.array().items(Amount.outputSchema),
      Price: Joi.array().items(
        Joi.object({
          PriceAmount: Joi.array().items(Amount.outputSchema).required(),
        })
      ),
      TaxTotal: Joi.array().items(TaxTotal.outputSchema),
    });
  }
}

module.exports = InvoiceLine;
