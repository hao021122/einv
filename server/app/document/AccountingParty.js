const Joi = require("joi");
const AccountID = require("./AccountID");
const Party = require("./Party");

/**
 * @param {object} additionalAccountID
 * @param {object} party
 */
class AccountingParty {
  constructor(additionalAccountID, party) {
    this.additionalAccountID = additionalAccountID; // { id, schemeAgencyName }
    this.party = party; // instance of Party
  }

  toMap() {
    const obj = {};

    if (this.additionalAccountID) {
      obj.AdditionalAccountID = [this.additionalAccountID.toMap()];
    }

    obj.Party = [this.party.toMap()];

    return obj;
  }

  static get outputSchema() {
    return Joi.array().items(
      Joi.object({
        AdditionalAccountID: Joi.array().items(AccountID.outputSchema).optional(),
        Party: Joi.array().items(Party.outputSchema).required()
      })
    )
  }
}

module.exports = AccountingParty;

// const Party = require('./Party');
// const AccountingParty = require('./AccountingParty');

// const supplierParty = new Party({
//   industryClassificationCode: {
//     code: "46510",
//     name: "Wholesale of computer hardware, software and peripherals"
//   },
//   partyIdentifications: [
//     { id: "Supplier's TIN", schemeID: "TIN" },
//     { id: "Supplier's BRN", schemeID: "BRN" },
//     { id: "NA", schemeID: "SST" },
//     { id: "NA", schemeID: "TTX" }
//   ],
//   addressLines: ["Lot 66", "Bangunan Merdeka", "Persiaran Jaya"],
//   city: "Kuala Lumpur",
//   postalZone: "50480",
//   countrySubentityCode: "10",
//   countryCode: "MYS",
//   registrationName: "Supplier's Name",
//   telephone: "+60123456789",
//   email: "supplier@email.com"
// });

// const accountingSupplierParty = new AccountingParty(
//   { id: "CPT-CCN-W-211111-KL-000002", schemeAgencyName: "CertEX" },
//   supplierParty
// );

// const output = {
//   AccountingSupplierParty: [accountingSupplierParty.toMap()]
// };
