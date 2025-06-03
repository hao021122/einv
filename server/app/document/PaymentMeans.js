const Joi = require("joi");
const codeList = require("../code/payment-mode.json");
const validCodes = codeList.map((c) => c.Code);

/**
 * @param {string} paymentMeansCode
 * @param {string} payeeFinancialAccount
 */
class PaymentMean {
  constructor(paymentMeansCode, payeeFinancialAccount) {
    this.paymentMeansCode = (paymentMeansCode ?? "").toString();
    this.payeeFinancialAccount = (payeeFinancialAccount ?? "").toString();
  }

  getPaymentMeansCode() {
    return this.paymentMeansCode;
  }

  getPayeeFinancialAccount() {
    return this.payeeFinancialAccount;
  }

  toMap() {
    return {
      PaymentMeansCode: [
        {
          _: this.paymentMeansCode,
        },
      ],
      PayeeFinancialAccount: [
        {
          ID: [
            {
              _: this.payeeFinancialAccount,
            },
          ],
        },
      ],
    };
  }

  static get outputSchema() {
    return Joi.object({
      PaymentMeansCode: Joi.array().items(
        Joi.object({
          _: Joi.string()
            .valid(...validCodes)
            .allow("")
            .default("")
            .optional()
            .messages({
              "string.base": "Payment Means Code must be a string",
              "any.only": `Invalid Payment Means Code. Must be one of: ${validCodes.join(
                ", "
              )}`,
            }),
        })
      ),
      PayeeFinancialAccount: Joi.array().items(
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
                  "string.base": "Payee Financial Account must be a string",
                  "string.max":
                    "Payee Financial Account must not exceed 150 characters",
                }),
            })
          ),
        })
      ),
    });
  }
}

module.exports = PaymentMean;
