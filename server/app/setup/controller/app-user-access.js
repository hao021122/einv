require("dotenv").config();
const secret = process.env.JWT_SECRET;

const { pgSql, db } = require("../../../lib/lib-pgsql");
const userAccessSchema = require("../model/user-access");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.login = async (req, res) => {
  try {
    let sid,
      errMsg,
      process = true;
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = userAccessSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res
        .status(400)
        .send(libApi.response(error.details.map((e) => ({ msg: e.message }))));

    const l = value.data[0];

    const valid = await db.oneOrNone(
      `
            SELECT login_id
            FROM ${pgSql.USER}
            WHERE login_id = $1
        `,
      [l.li]
    );

    if (!valid)
      return res
        .status(400)
        .send(libApi.response([{ msg: "Invalid User Account!!" }], "Failed"));

    // -------------------------------------
    // process
    // -------------------------------------
    const decode = libShared.decrypt(l.p);
    const hash = crypto.createHash("SHA-256").update(decode).digest("hex");
    const newSid = libShared.toNewGuid();
    const banTime = libShared.getDate();
    const banTime2 = libShared.addTime(banTime, 10, "m");
    const checkTime = libShared.addTime(banTime, -10, "m");

    const uObj = await db.one(
      `
            SELECT user_id, pwd, user_group_id
            FROM ${pgSql.USER}
            WHERE login_id = $1
        `,
      [l.li]
    );

    const suspend = await db.oneOrNone(
      `
            SELECT user_id, ban_time
            FROM ${pgSql.SUSPEND_LOG}
            WHERE user_id = $1
            AND ban_time > $2
            ORDER BY created_on DESC
            LIMIT 1;
        `,
      [uObj.user_id, banTime]
    );

    if (!uObj.user_id) {
      sid = 2;
      errMsg = "Invalid User!!";
      process = false;
    }

    if (
      suspend &&
      suspend.user_id === uObj.user_id &&
      suspend.ban_time > banTime
    ) {
      sid = 3;
      errMsg =
        "Your Login ID has been suspended, please try after " +
        libShared.toDateTime(suspend.ban_time);
      process = false;
    }

    const cnt = await db.oneOrNone(
      `
            SELECT COUNT(*), MAX(created_on)
            FROM ${pgSql.UAC_LOG} 
            WHERE status_id IN (3, 4)
            AND user_id = $1
            AND created_on >= $2
        `,
      [uObj.user_id, checkTime]
    );

    if (parseInt(cnt.count) >= 10 && !suspend) {
      sid = 3;
      errMsg =
        "Your Login ID has been suspended, please try after " +
        libShared.toDateTime(banTime2);
      process = false;

      await db.none(
        `
                INSERT INTO ${pgSql.SUSPEND_LOG} (
                    user_suspend_log_id, created_on, created_by, user_id, ban_time
                ) VALUES (
                    $1, $2, $3, $4, $5
                )
            `,
        [
          libShared.toNewGuid(),
          libShared.getDate(),
          "system",
          uObj.user_id,
          banTime2,
        ]
      );
    }

    if (uObj.pwd !== hash && sid !== 3) {
      sid = 4;
      errMsg = "Wrong Password";
      process = false;
    }

    if (process) {
      token = jwt.sign(
        // payload
        {
          uid: uObj.user_id,
          ug: uObj.user_group_id,
          li: uObj.login_id,
        },
        secret,
        {
          expiresIn: "3h",
          // algorithm: "HS512"
        }
      );
    }

    await db.none(
      `
            INSERT INTO ${pgSql.UAC_LOG} (
                user_access_log_id, created_on, login_id, user_id, user_group_id, sess_id, status_id, user_host, 
                user_agent, last_access_on, logout_on, browser_name, os_platform, browser_version
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            );
        `,
      [
        libShared.toNewGuid(),
        libShared.getDate(),
        l.li,
        uObj.user_id,
        uObj.user_group_id,
        newSid,
        sid,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------

    if (!process) {
      res.status(400).send(libApi.response([{ msg: errMsg }], "Failed"));
    } else {
      res
        .status(200)
        .send(
          libApi.response([{ msg: "Login Successfully!!", token }], "Success")
        );
    }
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to login. Error: " + err.message }],
          "Failed"
        )
      );
  }
};

exports.logout = async (req, res) => {
  try {
    // -------------------------------------
    // validation
    // -------------------------------------
    const { error, value } = userAccessSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error)
      return res
        .status(400)
        .send(libApi.response(error.details.map((e) => ({ msg: e.message }))));

    const l = value.data[0];

    if (!l.sid)
      return res
        .status(400)
        .send(libApi.response([{ msg: "Invalid Session ID!!" }], "Failed"));

    const valid = await db.oneOrNone(
      `
            SELECT sess_id
            FROM ${pgSql.UAC_LOG}
            WHERE sess_id = $1
        `,
      [l.sid]
    );

    if (!valid)
      return res
        .status(400)
        .send(libApi.response([{ msg: "Invalid Session!!" }], "Failed"));

    // -------------------------------------
    // process
    // -------------------------------------
    await db.none(
      `
        UPDATE ${pgSql.UAC_LOG}
        SET logout_on = $1
        WHERE sess_id = $2;
      `,
      [libShared.getDate(), l.sid]
    );

    // -------------------------------------
    // Append Log
    // -------------------------------------
  } catch (err) {
    res
      .status(500)
      .send(
        libApi.response(
          [{ msg: "Unable to login. Error: " + err.message }],
          "Failed"
        )
      );
  }
};
