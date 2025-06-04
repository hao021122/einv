const express = require("express");
const router = express.Router();
const sysSetupController = require("../controller/app-sys-setup");

router.get('/', sysSetupController.list);
router.post('/s', sysSetupController.create);
router.put('/u', sysSetupController.update);

module.exports = router;