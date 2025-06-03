const Joi = require("joi");

/**
 * Bill Reference Number (optional)
 * @param {string} id
 */
class BillReference {
  constructor(id) {
    this.id = (id ?? "").toString();
  }

  getId() {
    return this.id;
  }

  toMap() {
    return {
      AdditionalDocumentReference: [
        {
          ID: [
            {
              _: this.id,
            },
          ],
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      AdditionalDocumentReference: Joi.array()
        .items(
          Joi.object({
            ID: Joi.array().items(
              Joi.object({
                _: Joi.string()
                  .trim()
                  .max(150)
                  .allow("")
                  .default("")
                  .optional()
                  .messages({
                    "string.base": "Bill Reference Number must be a string",
                    "string.max":
                      "Bill Reference Number must not exceed 150 characters",
                  }),
              })
            ),
          })
        )
    });
  }
}

module.exports = BillReference;
