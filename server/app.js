const express = require("express");
const app = express();

const PORT = 48998;

const coProfile = require("./app/setup/routes/co-profile");
const document = require("./app/setup/routes/document");
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

app.use('/cp', coProfile);
app.use('/subdoc', document);
app.get('/test', async (req, res) => {
  try {
    const token = await sharedAPI.getDocType();
    res.status(200).send(token);
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).send({ error: 'Login failed', details: err.message });
  }
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});