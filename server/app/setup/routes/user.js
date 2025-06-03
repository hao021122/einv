const express = require("express");
const router = express.Router();
const userController = require("../controller/app-user");

router.get('/l', userController.list);
router.post('/s', userController.create);
router.put('/u', userController.update);

module.exports = router;