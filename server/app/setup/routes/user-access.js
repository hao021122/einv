const express = require("express");
const router = express.Router();
const userAccessController = require("../controller/app-user-access");

router.post('/li', userAccessController.login);
router.post('/lo', userAccessController.logout);

module.exports = router;