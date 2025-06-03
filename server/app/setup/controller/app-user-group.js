const { pgSql, db } = require("../../../lib/lib-pgsql");
const userGroupSchema = require("../model/user-group");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

const p0 = new libApi.apiCaller();

exports.create = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = userGroupSchema.validate(req.body, {
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

    const ug = value.data[0];

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
                INSERT INTO ${pgSql.USER_GROUP} (
                    created_on, created_by, modified_on, modified_by, user_group_desc, is_in_use, display_seq
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7 
                )
            `,
      [
        libShared.getDate(),
        "tester",
        libShared.getDate(),
        "tester",
        ug.ugd,
        ug.ia,
        ug.ds,
      ]
    );

    res
      .status(200)
      .send(
        libApi.response({ msg: "User Group created successfully!!" }, "Success")
      );
  } catch (err) {
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};

exports.list = async (req, res) => {
  const userGroupId = req.query.id; // optional query param: ?id=123

  try {
    let result;

    if (userGroupId) {
      result = await db.any(
        `
        SELECT 
          user_group_id AS ug,
          user_group_desc AS ugd,
          is_in_use AS ia,
          display_seq AS ds
        FROM ${pgSql.USER_GROUP}
        WHERE user_group_id = $1
        `,
        [userGroupId]
      );
    } else {
      result = await db.any(
        `
        SELECT 
          user_group_id AS ug,
          user_group_desc AS ugd,
          is_in_use AS ia,
          display_seq AS ds
        FROM ${pgSql.USER_GROUP}
        ORDER BY display_seq
        `
      );
    }

    res.status(200).send(libApi.response(result, "Success"));
  } catch (err) {
    console.error("Error fetching user groups:", err);
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};

exports.update = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = userGroupSchema.validate(req.body, {
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

    const ug = value.data[0];

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
                UPDATE ${pgSql.USER_GROUP} SET
                modified_on = $1, modified_by = $2, user_group_desc = $3, is_in_use = $4, display_seq = $5
                WHERE user_group_id = $6
            `,
      [libShared.getDate(), "tester", ug.ugd, ug.ia, ug.ds, ug.ug]
    );

    res
      .status(200)
      .send(
        libApi.response({ msg: "User Group updated successfully!!" }, "Success")
      );
  } catch (err) {
    res.status(500).send(libApi.response("Internal Server Error", "Failed"));
  }
};
