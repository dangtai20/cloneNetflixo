const express = require("express");
const filmController = require("../controllers/filmController");

const router = express.Router();

// ************ PUBLIC ROUTES ************

router.route("/").get(filmController.getFilms);

module.exports = router;
