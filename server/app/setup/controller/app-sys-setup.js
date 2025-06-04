const { pgSql, db } = require("pg-promise");
const sysSetupSchema = require("../model/sys-setup");
const lipApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");
const libApi = require("../../../lib/lib-api");

exports.create = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = sysSetupSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => ({ msg: e.message })),
          "Falied"
        )
      );

    const sys = value.data[0];

    const sysId = pgSql.fnToUuid(sys.si);
    const validation = await db.oneOrNone(
      `
        SELECT sys_url
        FROM ${pgSql.SYS_SETUP}
        WHERE 
          (sys_url = $1)
          AND sys_Setup_id <> $2;
      `,
      [sys.url, sysId]
    );

    if (validation)
      return res
        .status(400)
        .send(
          libApi.response([{ msg: "System URL already exists." }], "Failed")
        );

    // -------------------------------------
    // process
    // -------------------------------------
    const newId = libShared.toNewGuid();

    await db.none(
      `
            INSERT INTO ${pgSql.SYS_SETUP} (
                sys_setup_id, created_on, created_by, modified_on, modified_by, sys_desc, sys_url, is_in_use
            ) VALUES (
                 $1, $2, $3, $4, $5, $6, $7, $8
            );
        `,
      [
        newId,
        libShared.getDate(),
        "tester",
        libShared.getDate(),
        "tester",
        sys.sn,
        sys.url,
        sys.ia,
      ]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "System Setup added successfully!!", ref: newId }],
          "Success"
        )
      );
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to create system setup. Error: " + err.message }],
          "Failed"
        )
      );
  }
};

exports.list = async (req, res) => {
  const sysId = req.query.id;

  try {
    if (sysId) {
      result = await db.any(
        `
            SELECT
                a.sys_setup_id AS si,
                a.modified_on AS mo,
                a.modified_by AS mb,
                a.sys_desc AS sn,
                a.sys_url AS url,
                a.is_in_use AS ia
            FROM ${pgSql.SYS_SETUP} a
            WHERE a.sys_setup_id = $1;
        `,
        [sysId]
      );
    } else {
      result = await db.any(
        `
            SELECT
                a.sys_setup_id AS si,
                a.modified_on AS mo,
                a.modified_by AS mb,
                a.sys_desc AS sn,
                a.sys_url AS url,
                a.is_in_use AS ia
            FROM ${pgSql.SYS_SETUP} a
            ORDER BY a.sys_desc;
        `
      );
    }

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res.status(200).send(libApi.response(result, "Success"));
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to retrieve the list. Error: " + err.message }],
          "Failed"
        )
      );
  }
};

exports.update = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = sysSetupSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => ({ msg: e.message })),
          "Falied"
        )
      );

    const sys = value.data[0];

    if (!sys.si)
      return res
        .status(400)
        .send(libApi.response([{ msg: "System ID is required" }], "Failed"));

    const sysId = pgSql.fnToUuid(sys.si);

    const validation = await db.oneOrNone(
      `
        SELECT sys_url
        FROM ${pgSql.SYS_SETUP}
        WHERE 
          (sys_url = $1)
          AND sys_Setup_id <> $2;
      `,
      [sys.url, sysId]
    );

    if (validation)
      return res
        .status(400)
        .send(
          libApi.response([{ msg: "System URL already exists." }], "Failed")
        );

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
            UPDATE ${pgSql.SYS_SETUP}
            SET modified_on = $1, modified_by = $2, sys_desc = $3, sys_url = $4, is_in_use = $5
            WHERE sys_setup_id = $6;
        `,
      [libShared.getDate(), "tester", sys.sn, sys.url, sys.ia, sysId]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "System Setup updated successfully", ref: sysId }],
          "Success"
        )
      );
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to update the record. Error: " + err.message }],
          "Failed"
        )
      );
  }
};
