const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

const regex = require('../utils/regexUrl');

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(regex),
    trailerLink: Joi.string().required().pattern(regex),
    thumbnail: Joi.string().required().pattern(regex),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    movieId: Joi.number().required(),
  }),
}), createMovie);

router.delete('/movies/_id', celebrate({
  body: Joi.object().keys({
    movieId: Joi.number().required(),
  }),
}), deleteMovie);
