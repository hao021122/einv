const { pgSql, db } = require("../../../lib/lib-pgsql");
const companyProfileSchema = require("../model/co-profile");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

const p0 = new libApi.apiCaller();

const misc = require("../../code/msic.json");
const state = require("../../code/state-code.json");
const country = require("../../code/country-code.json");

exports.create = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = companyProfileSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => ({ msg: e.message })),
          "Failed"
        )
      );

    const co = value.data[0];

    const validMiscCode = misc.some((m) => m.Code === co.mc);
    const validMiscDesc = misc.some((m) => m.Description === co.md);
    const stateCode = state.some((s) => s.Code === co.s);
    const countryCode = country.some((c) => c.Code === co.c2);

    if (!validMiscCode)
      return res
        .status(400)
        .send(libApi.response("MISC Code not found!!", "Failed"));
    if (!validMiscDesc)
      return res
        .status(400)
        .send(libApi.response("MISC Description not found!!", "Failed"));
    if (!stateCode)
      return res
        .status(400)
        .send(libApi.response("State Code not found!!", "Failed"));
    if (!countryCode)
      return res
        .status(400)
        .send(libApi.response("Country Code not found!!", "Failed"));

    // -------------------------------------
    // process
    // -------------------------------------
    const newId = libShared.toNewGuid();

    await db.none(
      `
            INSERT INTO ${pgSql.COMPANY_PROFILE} (
                co_id, created_on, created_by, modified_on, modified_by, co_code,
                co_desc, tin_num, register_num, sst_num, ttx_num, email, misc_code,
                misc_desc, addr_line_1, addr_line_2, addr_line_3, post_code, city, 
                state, country, contact_number
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22
            );
        `,
      [
        newId,
        libShared.getDate(),
        "tester",
        libShared.getDate(),
        "tester",
        co.cc,
        co.cd,
        co.t1,
        co.brn,
        co.sst,
        co.t2,
        co.e,
        co.mc,
        co.md,
        co.a1,
        co.a2,
        co.a3,
        co.pc,
        co.c1,
        co.s,
        co.c2,
        co.cn,
      ]
    );

    return res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "Company Profile Added Successfully!!", ref: newId }],
          "Success"
        )
      );
  } catch (err) {
    console.log(err);
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};

exports.list = async (req, res) => {
  try {
    const result = await db.any(`
      SELECT 
        co_id AS cid,
        co_code AS cc,
        co_desc AS cd,
        tin_num AS t1,
        register_num AS brn,
        sst_num AS sst,
        ttx_num AS t2,
        email AS e,
        misc_code AS mc,
        misc_desc AS md,
        addr_line_1 AS a1,
        addr_line_2 AS a2,
        addr_line_3 AS a3,
        post_code AS pc,
        city AS c1,
        state AS s,
        country AS c2,
        contact_number AS cn
      FROM ${pgSql.COMPANY_PROFILE}
      LIMIT 1
    `);

    res.status(200).send(libApi.response(result, "Success"));
  } catch (err) {
    console.error("Error fetching company profiles:", err);
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};

exports.update = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = companyProfileSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => e.message),
          "Failed"
        )
      );

    const co = value.data[0];

    if (!co.cid) {
      return res
        .status(400)
        .send(libApi.response("Company ID is required", "Failed"));
    }

    const validMiscCode = misc.some((m) => m.Code === co.mc);
    const validMiscDesc = misc.some((m) => m.Description === co.md);
    const stateCode = state.some((s) => s.Code === co.s);
    const countryCode = country.some((c) => c.Code === co.c2);

    if (!validMiscCode)
      return res
        .status(400)
        .send(libApi.response("MISC Code not found!!", "Failed"));
    if (!validMiscDesc)
      return res
        .status(400)
        .send(libApi.response("MISC Description not found!!", "Failed"));
    if (!stateCode)
      return res
        .status(400)
        .send(libApi.response("State Code not found!!", "Failed"));
    if (!countryCode)
      return res
        .status(400)
        .send(libApi.response("Country Code not found!!", "Failed"));

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
            UPDATE ${pgSql.COMPANY_PROFILE} SET
            modified_on = $1, modified_by = $2, co_code = $3, co_desc = $4, tin_num = $5,
            register_num = $6, sst_num = $7, ttx_num = $8, email = $9, misc_code = $10,
            misc_desc = $11, addr_line_1 = $12, addr_line_2 = $13, addr_line_3 = $14, 
            post_code = $15, city = $16, state = $17, country = $18, contact_number = $19
            WHERE co_id = $20
        `,
      [
        libShared.getDate(),
        "tester",
        co.cc,
        co.cd,
        co.t1,
        co.brn,
        co.sst,
        co.t2,
        co.e,
        co.mc,
        co.md,
        co.a1,
        co.a2,
        co.a3,
        co.pc,
        co.c1,
        co.s,
        co.c2,
        co.cn,
        co.cid,
      ]
    );

    return res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "Company Profile Updated Successfully!!", ref: co.cid }],
          "Success"
        )
      );
  } catch (err) {
    console.log(err);
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};
