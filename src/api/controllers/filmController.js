const Film = require("../models/FilmModel");
const Countries = require("../models/CountriesModel");
const Categories = require("../models/CategoriesModel");
const Episodes = require("../models/EpisodeModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// ************ PUBLIC CONTROLLER ************

// @desc    Get all films
// @route   GET /api/v1/films
// @access  Public

exports.getFilms = catchAsync(async (req, res, next) => {
  // filter films by categories, year, countries, rate
  const { categories, year, countries, rate } = req.query;

  // get id of categories
  let idCategories;
  if (categories) {
    const resultCategories = await Categories.findOne({ name: categories });
    idCategories = resultCategories._id;
  }

  // get id of countries
  let idCountries;
  if (countries) {
    const resultCountries = await Countries.findOne({ name: countries });
    idCountries = resultCountries._id;
  }

  // query
  let query = {
    ...(idCategories && { categories: idCategories }),
    ...(year && { year }),
    ...(idCountries && { countries: idCountries }),
    ...(rate && { rate: { $gte: rate } }),
  };

  // projection
  const projection = {
    name: 1,
    slug: 1,
    origin_name: 1,
    thumb_url: 1,
    poster_url: 1,
    year: 1,
  };

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  // get films
  const films = await Film.find(query, projection).skip(skip).limit(limit);

  // check if no film found
  if (films.length === 0) {
    return next(new AppError("No film found", 404));
  }

  const count = await Film.countDocuments(query);

  res.status(200).json({
    status: "success",
    data: [...films],
    pagination: {
      totalFilms: count,
      totalFilmPerPage: films.length,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
});

// @desc   Get film by slug
// @route  GET /api/v1/films/:slug
// @access Public

exports.getFilmBySlug = catchAsync(async (req, res, next) => {
  const projection = { __v: 0 };

  const film = await Film.findOne({ slug: req.params.slug }, projection)
    .populate("categories", "-__v")
    .populate("countries", "-__v")
    .exec();

  if (!film) {
    return next(new AppError("No film found", 404));
  }

  const episodes = await Episodes.find({ film_id: film._id });
  film.episodes = episodes;

  res.status(200).json({
    status: "success",
    data: film,
  });
});
