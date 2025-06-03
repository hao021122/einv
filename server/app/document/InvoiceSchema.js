const Joi = require("joi");
const InvoiceID = require("./InvoiceID");
const IssueDate = require("./IssueDate");
const IssueTime = require("./IssueTime");
const InvoiceTypeCode = require("./InvoiceTypeCode");
const CurrencyCode = require("./CurrencyCode");
const InvoicePeriod = require("./InvoicePeriod");
const BillingReference = require("./BillReference");
const AdditionalDocReference = require("./AdditionalDocReference");
const AccountingParty = require("./AccountingParty");
const Delivery = require("./Delivery");
const PaymentMeans = require("./PaymentMeans");
const PaymentTerms = require("./PaymentTerms");
const PrepaidPayment = require("./PrepaidPayment");
const AllowanceCharge = require("./AllowanceCharge");
const TaxTotal = require("./TaxTotal");
const LegalMonetaryTotal = require("./LegalMonetaryTotal");
const InvoiceLine = require("./InvoiceLine");

class InvoiceSchema {
  static get outputSchema() {
    return Joi.array().items(
      Joi.object({
        // _D: Joi.string().optional(),
        // _A: Joi.string().optional(),
        // _B: Joi.string().optional(),
        ID: Joi.array().items(InvoiceID.outputSchema).required(),
        IssueDate: Joi.array().items(IssueDate.outputSchema).required(),
        IssueTime: Joi.array().items(IssueTime.outputSchema).required(),
        InvoiceTypeCode: Joi.array()
          .items(InvoiceTypeCode.outputSchema)
          .required(),
        DocumentCurrencyCode: Joi.array()
          .items(CurrencyCode.currencyCodeSchema)
          .required(),
        InvoicePeriod: Joi.array().items(InvoicePeriod.outputSchema).required(),
        BillingReference: Joi.array()
          .items(BillingReference.outputSchema)
          .required(),
        AdditionalDocumentReference: Joi.array()
          .items(AdditionalDocReference.outputSchema)
          .required(),
        AccountingSupplierParty: AccountingParty.outputSchema.required(),
        AccountingCustomerParty: AccountingParty.outputSchema.required(),
        Delivery: Joi.array().items(Delivery.outputSchema).required(),
        PaymentMeans: Joi.array().items(PaymentMeans.outputSchema).required(),
        PaymentTerms: Joi.array().items(PaymentTerms.outputSchema).required(),
        PrepaidPayment: Joi.array()
          .items(PrepaidPayment.outputSchema)
          .required(),
        AllowanceCharge: Joi.array()
          .items(AllowanceCharge.outputSchema)
          .required(),
        TaxTotal: Joi.array().items(TaxTotal.outputSchema).required(),
        LegalMonetaryTotal: Joi.array()
          .items(LegalMonetaryTotal.outputSchema)
          .required(),
        InvoiceLine: Joi.array().items(InvoiceLine.outputSchema).required(),
      })
    );
  }
}

module.exports = InvoiceSchema;
