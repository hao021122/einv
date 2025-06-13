const { pgSql, db, pgp } = require("../../../lib/lib-pgsql");
const { userGroupSchema } = require("../model/user-group");
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

    if (error)
      return res.status(400).send(
        libApi.response(
          error.details.map((e) => ({ msg: e.message })),
          "Failed"
        )
      );

    const ug = value.data[0];

    const ugId = pgSql.fnToUuid(ug.ug);

    const validation = await db.oneOrNone(
      `
        SELECT user_group_desc
        FROM ${pgSql.USER_GROUP}
        WHERE 
          user_group_desc = $1
          AND user_group_id <> $2;
      `,
      [ug.ugd, ugId]
    );

    if (validation)
      return res
        .status(400)
        .send(
          libApi.response(
            [{ msg: "User Group Description already exists." }],
            "Failed"
          )
        );

    const existsAxn = await db.manyOrNone(
      `
        SELECT action_id
        FROM ${pgSql.AXN}
        WHERE is_in_use = 1
        AND is_default_func = 0
        AND action_id IN ($1:csv)
      `,
      [allAxnIds]
    );

    if (ug.a.length > 0) {
      const foundIds = new Set(existsAxn.map((row) => row.action_id));
      const invalid = ug.a.filter((id) => !foundIds.has(id));
      return res
        .status(400)
        .send(libApi.response([{ msg: "Invalid Action!! " }], "Failed"));
    }

    // -------------------------------------
    // process
    // -------------------------------------
    const newId = libShared.toNewGuid();

    // Tranasaction
    await db.tx(async (t) => {
      // Insert User Group
      await t.none(
        `
        INSERT INTO ${pgSql.USER_GROUP} (
          user_group_id, created_on, created_by, modified_on, modified_by, user_group_desc, is_in_use, display_seq
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `,
        [
          newId,
          libShared.getDate(),
          "tester",
          libShared.getDate(),
          "tester",
          ug.ugd,
          ug.ia,
          ug.ds,
        ]
      );

      // Insert User Group Action
      if (Array.isArray(ug.a) && ug.a.length > 0) {
        const axnVal = ug.a.map((axnId) => ({
          id: libShared.toNewGuid(),
          createdOn: libShared.getDate(),
          createdBy: "tester",
          ug: newId,
          action: axnId,
        }));

        const cs = new pgp.helpers.ColumnSet(
          [
            "user_group_action_id",
            "created_on",
            "created_by",
            "user_group_id",
            "action_id",
          ],
          { table: pgSql.GROUP_AXN }
        );

        const insert = pgp.helpers.insert(axnVal, cs);
        await t.none(insert);
      }
    });

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "User Group created successfully!!", ref: newId }],
          "Success"
        )
      );
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to create user group. Error: " + err.message }],
          "Failed"
        )
      );
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
          a.modified_on as mo,
          a.modified_by AS mb,
          a.user_group_id AS ug,
          a.user_group_desc AS ugd,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'aid', c.action_id,
                'a', c.action_desc
              )
            ) FILTER (WHERE b.action_id IS NOT NULL),
             '[]'
          ) AS axn,
          a.is_in_use AS ia,
          a.display_seq AS ds
        FROM ${pgSql.USER_GROUP} a
        LEFT JOIN ${pgSql.GROUP_AXN} b ON b.user_group_id = a.user_group_id
        LEFT JOIN ${pgSql.AXN} c ON c.action_id = b.action_id
        WHERE user_group_id = $1
        GROUP BY a.user_group_id
        `,
        [userGroupId]
      );
    } else {
      result = await db.any(
        `
        SELECT 
          a.modified_on as mo,
          a.modified_by AS mb,
          a.user_group_id AS ug,
          a.user_group_desc AS ugd,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'aid', c.action_id,
                'a', c.action_desc
              )
            ) FILTER (WHERE b.action_id IS NOT NULL),
             '[]'
          ) AS axn,
          a.is_in_use AS ia,
          a.display_seq AS ds
        FROM ${pgSql.USER_GROUP} a
        LEFT JOIN ${pgSql.GROUP_AXN} b ON b.user_group_id = a.user_group_id
        LEFT JOIN ${pgSql.AXN} c ON c.action_id = b.action_id
        GROUP BY a.user_group_id
        ORDER BY display_seq
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
    const { error, value } = userGroupSchema.validate(req.body, {
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

    const ug = value.data[0];

    if (!ug.ug) {
      return res
        .status(400)
        .send(
          libApi.response([{ msg: "User Group ID is required" }], "Failed")
        );
    }

    const ugId = pgSql.fnToUuid(ug.ug);

    const validation = await db.oneOrNone(
      `
        SELECT user_group_desc
        FROM ${pgSql.USER_GROUP}
        WHERE 
          user_group_desc = $1
          AND user_group_id <> $2;
      `,
      [ug.ugd, ugId]
    );

    if (validation)
      return res
        .status(400)
        .send(
          libApi.response(
            [{ msg: "User Group Description already exists." }],
            "Failed"
          )
        );

    const existsAxn = await db.manyOrNone(
      `
        SELECT action_id
        FROM ${pgSql.AXN}
        WHERE is_in_use = 1
        AND is_default_func = 0
        AND action_id IN ($1:csv)
      `,
      [ug.a]
    );

    if (ug.a.length > 0) {
      const foundIds = new Set(existsAxn.map((row) => row.action_id));
      const invalid = ug.a.filter((id) => !foundIds.has(id));
      if (invalid.length > 0)
        return res
          .status(400)
          .send(libApi.response([{ msg: "Invalid Action!! " }], "Failed"));
    }

    // -------------------------------------
    // process
    // -------------------------------------
    await db.tx(async (t) => {
      // Insert User Group
      await t.none(
        `
        UPDATE ${pgSql.USER_GROUP} SET
        modified_on = $1, modified_by = $2, user_group_desc = $3, is_in_use = $4, display_seq = $5
        WHERE user_group_id = $6
      `,
        [libShared.getDate(), "tester", ug.ugd, ug.ia, ug.ds, ugId]
      );

      const exists = await t.manyOrNone(
        `
          SELECT action_id
          FROM ${pgSql.GROUP_AXN}
          WHERE user_group_id = $1
        `,
        [ugId]
      );

      if (exists.length > 0) {
        await t.none(
          `
            DELETE FROM ${pgSql.GROUP_AXN} WHERE user_group_id = $1
          `,
          [ugId]
        );
      }

      // Insert User Group Action
      if (Array.isArray(ug.a) && ug.a.length > 0) {
        const axnVal = ug.a.map((axnId) => ({
          user_group_action_id: libShared.toNewGuid(),
          created_on: libShared.getDate(),
          created_by: "tester",
          user_group_id: ugId,
          action_id: axnId,
        }));

        const cs = new pgp.helpers.ColumnSet(
          [
            "user_group_action_id",
            "created_on",
            "created_by",
            "user_group_id",
            "action_id",
          ],
          { table: pgSql.GROUP_AXN }
        );

        const insert = pgp.helpers.insert(axnVal, cs);
        await t.none(insert);
      }
    });

    // -------------------------------------
    // Append Log
    // -------------------------------------

    res
      .status(200)
      .send(
        libApi.response(
          [{ msg: "User Group updated successfully!!", ref: ugId }],
          "Success"
        )
      );
  } catch (err) {
    console.log(err);
    
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
