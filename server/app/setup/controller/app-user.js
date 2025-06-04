const crypto = require("crypto");

const { pgSql, db } = require("../../../lib/lib-pgsql");
const userSchema = require("../model/user");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

const p0 = new libApi.apiCaller();

exports.create = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = userSchema.validate(req.body, {
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
    const u = value.data[0];

    const userId = pgSql.fnToUuid(u.u);
    const validation = await db.oneOrNone(
      `
        SELECT user_name, login_id, email
        FROM ${pgSql.USER}
        WHERE 
          (user_name = $1 OR login_id = $2 OR email = $3)
          AND user_id <> $4;
      `,
      [u.un, u.li, u.e, userId]
    );

    if (validation) {
      return res
        .status(400)
        .send(
          libApi.response(
            [{ msg: "Username, Email or Login ID already exists." }],
            "Failed"
          )
        );
    }

    // -------------------------------------
    // process
    // -------------------------------------
    const decode = libShared.decrypt(u.p);
    const hash = crypto.createHash("SHA-256").update(decode).digest("hex");
    const newId = libShared.toNewGuid();

    await db.none(
      `
        INSERT INTO ${pgSql.USER} (
          user_id, created_on, created_by, modified_on, modified_by, user_group_id, user_name, login_id, email, pwd, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 
        );
      `,
      [
        newId,
        libShared.getDate(),
        "tester",
        libShared.getDate(),
        "tester",
        u.ug,
        u.un,
        u.li,
        u.e,
        hash,
        u.ia,
      ]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "User added successfully!!", ref: newId }],
          "Success"
        )
      );
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to create user. Error: " + err.message }],
          "Failed"
        )
      );
  }
};

exports.list = async (req, res) => {
  const userId = req.query.id; // optional query param: ?id=123

  try {
    let result;

    if (userId) {
      result = await db.any(
        `
          SELECT 
            a.modified_on AS mo,
            a.modified_by AS md,
            a.user_id AS u,
            a.user_group_id AS ug,
            b.user_group_desc AS ugd,
            a.user_name AS un,
            a.login_id AS li,
            a.email AS e,
            a.is_active AS ia
          FROM ${pgSql.USER} a
          LEFT JOIN ${pgSql.USER_GROUP} b ON b.user_group_id = a.user_group_id
          WHERE a.user_id = $1
          ORDER BY a.user_name
          `,
        [userId]
      );
    } else {
      result = await db.any(
        `
          SELECT 
            a.modified_on AS mo,
            a.modified_by AS md,
            a.user_id AS u,
            a.user_group_id AS ug,
            b.user_group_desc AS ugd,
            a.user_name AS un,
            a.login_id AS li,
            a.email AS e,
            a.is_active AS ia
          FROM ${pgSql.USER} a
          LEFT JOIN ${pgSql.USER_GROUP} b ON b.user_group_id = a.user_group_id
          ORDER BY a.login_id
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
    const { error, value } = userSchema.validate(req.body, {
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

    const u = value.data[0];

    if (!u.u) {
      return res
        .status(400)
        .send(libApi.response([{ msg: "User ID is required" }], "Failed"));
    }

    const userId = pgSql.fnToUuid(u.u);

    const validation = await db.oneOrNone(
      `
        SELECT user_name, login_id, email
        FROM ${pgSql.USER}
        WHERE 
          (user_name = $1 OR login_id = $2 OR email = $3)
          AND user_id <> $4;
      `,
      [u.un, u.li, u.e, userId]
    );

    if (validation) {
      return res
        .status(400)
        .send(
          libApi.response(
            [{ msg: "Username, Email or Login ID already exists." }],
            "Failed"
          )
        );
    }

    // -------------------------------------
    // process
    // -------------------------------------
    const decode = libShared.decrypt(u.p);
    const hash = crypto.createHash("SHA-256").update(decode).digest("hex");

    await db.none(
      `
        UPDATE ${pgSql.USER} SET
        modified_on = $1, modified_by = $2, user_group_id = $3, user_name = $4, login_id = $5, email = $6, pwd = $7, is_active = $8
        WHERE user_id = $9
      `,
      [libShared.getDate(), "tester", u.ug, u.un, u.li, u.e, hash, u.ia, userId]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "User updated successfully!!", ref: userId }],
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
