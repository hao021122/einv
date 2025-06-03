const express = require("express");
const router = express.Router();
const DocumentController = require("../controller/app-submit-doc");

router.post('/s', DocumentController.submit);

module.exports = router;