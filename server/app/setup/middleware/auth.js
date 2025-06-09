const { pgSql, db } = require("../../../lib/lib-pgsql");
const libApi = require("../../../lib/lib-api");
const libShared = require("../../../lib/lib-shared");

function Auth() {};

Auth.checkAuth = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "Failed",
      message: "Access Denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // attach user info to request
    next(); // continue to the route
  } catch (err) {
    return res.status(401).json({
      status: "Failed",
      message: "Invalid or expired token.",
    });
  }
};

Auth.checkPermission = async function (req, res, next) {

}