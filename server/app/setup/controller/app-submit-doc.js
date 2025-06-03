require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

const Joi = require("joi");
const crypto = require("crypto");

const InvoiceID = require("../../document/InvoiceID");
const IssueDate = require("../../document/IssueDate");
const IssueTime = require("../../document/IssueTime");
const InvoiceTypeCode = require("../../document/InvoiceTypeCode");
const CurrencyCode = require("../../document/CurrencyCode");
const InvoicePeriod = require("../../document/InvoicePeriod");
const BillingReference = require("../../document/BillReference");
const AdditionalDocReference = require("../../document/AdditionalDocReference");
const AccountingParty = require("../../document/AccountingParty");
const AccountID = require("../../document/AccountID");
const Party = require("../../document/Party");
const Amount = require("../../document/Amount");
const Shipment = require("../../document/Shipment");
const Delivery = require("../../document/Delivery");
const PaymentMeans = require("../../document/PaymentMeans");
const PaymentTerms = require("../../document/PaymentTerms");
const PrepaidPayment = require("../../document/PrepaidPayment");
const AllowanceCharge = require("../../document/AllowanceCharge");
const TaxTotal = require("../../document/TaxTotal");
const TaxCategory = require("../../document/TaxCategory");
const TaxSchema = require("../../document/TaxSchema");
const TaxSubTotal = require("../../document/TaxSubTotal");
const LegalMonetoryTotal = require("../../document/LegalMonetaryTotal");
const InvoiceLine = require("../../document/InvoiceLine");
const InvoiceItem = require("../../document/InvoiceItem");
const Invoice = require("../../document/InvoiceSchema");
const documentSchema = require("../model/document");

const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

const { systemLogin } = require("../../api/api-shared");

/**
 *
 * @param {object} doc
 * documentHash use JSON.stringify(invoice) then sha-256 
 * document use JSON.stringify(invoice) then base64 encode
 * Response: {
    "submissionUid": "XZSP9DWNSQ81BDNCPX1A3YVJ10",
    "acceptedDocuments": [
        {
            "uuid": "ZK20KVDJ8Y54H8TVQX1A3YVJ10",
            "invoiceCodeNumber": "167071324521"
        }
    ],
    "rejectedDocuments": []
}
 */
// async function submitDocument(doc = {}) {}

exports.submit = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = documentSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });
    console.log(value);
    console.log(value.supplier);
    console.log(value.buyer);

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => e.message),
          "Failed"
        )
      );

    //

    const inv = {
      ID: [new InvoiceID(value.id).toMap()],
      IssueDate: [new IssueDate(value.date).toMap()],
      IssueTime: [new IssueTime(value.time).toMap()],
      InvoiceTypeCode: [
        new InvoiceTypeCode(value.invType.code, value.invType.version).toMap(),
      ],
      DocumentCurrencyCode: [new CurrencyCode(value.currencyCode).toMap()],
      InvoicePeriod: [
        new InvoicePeriod(
          value.period.startDate,
          value.period.endDate,
          value.period.desc
        ).toMap(),
      ],
      BillingReference: [new BillingReference(value.billRefer).toMap()],
      AdditionalDocumentReference: value.additionalInfo.map((ref) =>
        new AdditionalDocReference(ref.id).toMap()
      ),
      AccountingSupplierParty: [
        new AccountingParty(
          new AccountID(value.supplier.acctId, value.supplier.scheme),
          new Party(value.supplier)
        ).toMap(),
      ],
      AccountingCustomerParty: [
        new AccountingParty(null, new Party(value.buyer)).toMap(),
      ],
      Delivery: [
        new Delivery(
          new Party(value.delivery),
          new Shipment(
            value.delivery.id,
            new AllowanceCharge(
              value.delivery.chargeIndicator,
              value.delivery.reason,
              new Amount(value.delivery.amount, value.currencyCode)
            )
          )
        ).toMap(),
      ],
      PaymentMeans: [
        new PaymentMeans(value.payment.code, value.payment.account).toMap(),
      ],
      PaymentTerms: [new PaymentTerms(value.payment.note).toMap()],
      PrepaidPayment: [
        new PrepaidPayment(
          value.payment.desc,
          new Amount(value.payment.amount, value.currencyCode),
          value.payment.paidDate,
          value.payment.paidTime
        ).toMap(),
      ],
      AllowanceCharge: value.allowanceCharge.map((item) =>
        new AllowanceCharge(
          item.chargeIndicator,
          item.reason,
          new Amount(item.amount.amount, value.currencyCode)
        ).toMap()
      ),
      TaxTotal: [
        new TaxTotal(
          new Amount(value.taxTotal.taxAmount, value.currencyCode),

          value.taxTotal.taxSubtotal.map(
            (tax) =>
              new TaxSubTotal(
                new Amount(tax.taxableAmt, value.currencyCode),
                new Amount(tax.taxAmount2, value.currencyCode),
                new TaxCategory(
                  tax.taxCategory,
                  new TaxSchema()
                  //tax.taxCategory.taxSchema.id,
                  //tax.taxCategory.taxSchema.schemaID,
                  //tax.taxCategory.taxSchema.schemaAgencyID
                )
              )
          )
        ).toMap(),
      ],
      LegalMonetaryTotal: [
        new LegalMonetoryTotal(
          new Amount(value.legal.lea, value.currencyCode), // LineExtensionAmount
          new Amount(value.legal.tea, value.currencyCode), // TaxExclusiveAmount
          new Amount(value.legal.tia, value.currencyCode), // TaxInclusiveAmount
          new Amount(value.legal.ata, value.currencyCode), // AllowanceTotalAmount
          new Amount(value.legal.cta, value.currencyCode), // ChargeTotalAmount
          new Amount(value.legal.pra, value.currencyCode), // PayableRoundingAmount
          new Amount(value.legal.pa, value.currencyCode) // PayableAmount
        ).toMap(),
      ],
      InvoiceLine: value.invoiceLine.map((item) => {
        // Allowance Charges
        const lineAllowanceCharges = item.allowanceCharge.map(
          (a) =>
            new AllowanceCharge(
              a.chargeIndicator,
              a.reason,
              new Amount(a.amount.amt, value.currencyCode),
              a.mfn
            )
        );

        // Tax Subtotals
        const taxSubtotals = item.taxTotal.taxSubtotal.map(
          (st) =>
            new TaxSubTotal(
              new Amount(st.taxableAmt, value.currencyCode),
              new Amount(st.taxAmount2, value.currencyCode),
              new TaxCategory(st.taxCategory, new TaxSchema(), st.taxDesc)
            )
        );

        // Tax Total
        const lineTax = new TaxTotal(
          new Amount(item.taxTotal.taxAmount, value.currencyCode),
          taxSubtotals
        );

        // Construct Invoice Line
        return new InvoiceLine(
          lineAllowanceCharges,
          item.id,
          item.quantity,
          item.unitCode,
          new InvoiceItem(item.classCode, item.desc),
          new Amount(item.itemPriceExtension, value.currencyCode),
          new Amount(item.lineExtensionAmount, value.currencyCode),
          new Amount(item.price, value.currencyCode),
          lineTax
        ).toMap();
      }),
    };
    const fullSchema = Joi.object({
      // _D: Joi.string().allow(""),
      // _A: Joi.string().allow(""),
      // _B: Joi.string().allow(""),
      Invoice: Invoice.outputSchema,
    });

    const data = {
      // _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      // _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      // _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      Invoice: [inv], // <-- note the wrapping
    };

    const { error: schemaError, value: schemaValue } =
      fullSchema.validate(data);
    console.log(schemaValue);

    if (schemaError) {
      console.error("Validation failed", schemaError.details);
      return res.status(400).send(
        libApi.response(
          schemaError.details.map((e) => e.message),
          "Failed"
        )
      );
    }
console.log(JSON.stringify(data));

    let hash = crypto
      .createHash("SHA-256")
      .update(JSON.stringify(data))
      .digest("hex");
    let base64Encode = Buffer.from(JSON.stringify(data), "utf-8").toString(
      "base64"
    );
    // res.json({hash, base64Encode})
    try {
      // console.log(hash);
      // console.log(value.id);
      // console.log(base64Encode);
      
      
      
      const url = `https://${BASE_URL}/api/v1.0/documentsubmissions/`;
      const body = {
        "documents": [
          {
            "format": "JSON",
            "documentHash": `${hash}`,
            "codeNumber": `${value.id}`,
            "document": `${base64Encode}`,
          },
        ],
      };
      // console.log(JSON.stringify(body));
      // res.json(body)
      const token = await systemLogin();
      console.log(token);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log(response);

      if (!response.ok) {
        const err = await response.text();
        return res.json({ err });
      }

      const success = await response.json();
      console.log(success);

      res.json(success);
    } catch (err) {
      console.error("Fetch failed:", err);
      res
        .status(500)
        .json({ error: "Failed to call API", detail: err.message });
    }
  } catch (err) {
    console.log(err);
  }
};
