const express = require("express");
const app = express();

const PORT = 48998;

const coProfile = require("./app/setup/routes/co-profile");
const userGroup = require("./app/setup/routes/user-group");
const user = require("./app/setup/routes/user");
const sysSetup = require("./app/setup/routes/sys-setup");
const document = require("./app/setup/routes/document");
const uac = require("./app/setup/routes/user-access");
const sharedAPI = require("./app/api/api-shared");

// ✅ JSON Middleware (Only for JSON requests)
app.use((req, res, next) => {
  if (req.is("application/json")) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// ✅ URL Encoded Middleware (Only for form-urlencoded)
app.use((req, res, next) => {
  if (req.is("application/x-www-form-urlencoded")) {
    express.urlencoded({ extended: true })(req, res, next);
  } else {
    next();
  }
});

app.use("/uac", uac);
app.use("/cp", coProfile);
app.use("/ug", userGroup);
app.use("/u", user);
app.use("/sys", sysSetup);
app.use("/subdoc", document);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
