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
    console.log(value);

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => e.message),
          "Failed"
        )
      );

    const u = valid.data[0];

    // -------------------------------------
    // process
    // -------------------------------------
    const newId = libShared.toNewGuid();

    await db.none(
      `
                        INSERT INTO ${pgSql.USER} (
                            user_id, created_on, created_by, modified_on, modified_by, user_group_id, user_name, login_id, email, pwd, is_active
                        ) VALUE (
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
        u.p,
        u.ia,
      ]
    );

    res
      .status(200)
      .send(
        libApi.response(
          { msg: "User Added Successfully!!", ref: newId },
          "Success"
        )
      );
  } catch (err) {
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
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
            a.is_active AS ia,
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
            a.is_active AS ia,
          FROM ${pgSql.USER} a
          LEFT JOIN ${pgSql.USER_GROUP} b ON b.user_group_id = a.user_group_id
          ORDER BY a.login_id
          `
      );
    }

    res.status(200).send(libApi.response(result, "Success"));
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
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
    console.log(value);

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => e.message),
          "Failed"
        )
      );

    const u = valid.data[0];

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
                UPDATE ${pgSql.USER} SET
                modified_on = $1, modified_by = $2, user_group_id = $3, user_name = $4, login_id = $5, email = $6, pwd = $7, is_active = $8
                WHERE user_id = $9
            `,
      [libShared.getDate(), "tester", u.ug, u.un, u.li, u.e, u.p, u.ia, u.u]
    );

    res
      .status(200)
      .send(
        libApi.response(
          { msg: "User Updated Successfully!!", ref: u.u },
          "Success"
        )
      );
  } catch (err) {
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};
