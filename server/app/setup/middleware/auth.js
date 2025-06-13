const { pgSql, db } = require("../../../lib/lib-pgsql");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

exports.checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .send(libApi.response([{ msg: "Unauthorized" }], "Failed"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .send(libApi.response([{ msg: "Invalid or expired token" }], "Failed"));
  }
};

exports.checkPermission = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send(libApi.response([{ msg: "Unauthorized" }], "Failed"));
    }

    const token = authHeader.split(" ")[1];

    await db.oneOrNone(
      `
        
      `,
      []
    )
  } catch (err) {}
};
