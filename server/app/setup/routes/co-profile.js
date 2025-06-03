const express = require("express");
const router = express.Router();
const coProfileController = require("../controller/app-co-profile");

router.get('/l', coProfileController.list);
router.post('/s', coProfileController.create);
router.put('/u', coProfileController.update);

module.exports = router;