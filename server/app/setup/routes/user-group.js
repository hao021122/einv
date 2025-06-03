const express = require("express");
const router = express.Router();
const userGroupController = require("../controller/app-user-group");

router.get('/l', userGroupController.list);
router.post('/s', userGroupController.create);
router.put('/u', userGroupController.update);

module.exports = router;