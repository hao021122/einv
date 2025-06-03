const Joi = require("joi");
const Amount = require("./Amount");

/**
 * @param {Object}
 * @param {string} id
 * @param {number} amount
 * @param {date} date
 * @param {time} time
 */
class PrepaidPayment {
  constructor(id, amount, date, time) {
    (this.id = id ?? ""),
      (this.amount = amount),
      (this.date = date ?? ""),
      (this.time = time ?? "");
  }

  getId() {
    return this.id;
  }

  getAmount() {
    return this.amount;
  }

  getDate() {
    return this.date;
  }

  getTime() {
    return this.time;
  }

  toMap() {
    return {
      ID: [
        {
          _: this.id,
        },
      ],
      PaidAmount: [this.amount.toMap()],
      PaidDate: [
        {
          _: this.date,
        },
      ],
      PaidTime: [
        {
          _: this.time,
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      ID: Joi.array().items(
        Joi.object({
          _: Joi.string().max(150).allow("").optional().messages({
            "string.base": "Prepayment Reference Number must be a string",
            "string.max":
              "Prepayment Reference Number must not exceed 150 characters",
          }),
        })
      ),
      PaidAmount: Joi.array().items(Amount.outputSchema).optional(),
      PaidDate: Joi.array()
        .items(
          Joi.object({
            _: Joi.string()
              .pattern(/^\d{4}-\d{2}-\d{2}$/)
              .allow("")
              .default(() => new Date().toISOString().slice(0, 10))
              .optional()
              .messages({
                "string.pattern.base":
                  "Paid Date must be in the format YYYY-MM-DD",
              }),
          })
        )
        .required(),

      PaidTime: Joi.array().items(
        Joi.object({
          _: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)Z$/)
            .default(() => {
              const now = new Date().toISOString().slice(11, 19);
              return `${now}Z`;
            })
            .allow("")
            .optional()
            .messages({
              "string.pattern.base":
                "Paid Time must be in the format hh:mm:ssZ",
            }),
        })
      ),
    });
  }
}

module.exports = PrepaidPayment;
