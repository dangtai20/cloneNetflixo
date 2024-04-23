const express = require("express");
const testController = require("../controllers/testController");

const router = express.Router();

router.route("/").get(testController.testFunction, testController.testError);

module.exports = router;


