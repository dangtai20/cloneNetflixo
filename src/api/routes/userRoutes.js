const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();


router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/verify/:token").get(userController.verifyUser);


module.exports = router;