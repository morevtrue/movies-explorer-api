const Movie = require('../models/movie');

const { NotFoundError } = require('../errors/not-found-error');
const { BadRequestError } = require('../errors/bad-request-error');
const { ForbiddenError } = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.user._id;
  Movie.find({})
    .then((movie) => {
      // eslint-disable-next-line no-underscore-dangle
      if (userId === movie.owner._id.toString()) {
        res.send(movie);
      }
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: userId,
  })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('переданы некорректные данные в методы создания карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { movieId } = req.params;
  // eslint-disable-next-line no-underscore-dangle
  const userId = req.user._id;

  Movie.findById(movieId)
    .orFail(() => new NotFoundError('Фильм с указанным id не существует'))
    .then((movie) => {
      // eslint-disable-next-line no-underscore-dangle
      if (userId !== movie.owner._id.toString()) {
        throw new ForbiddenError('Фильм не принадлежит пользователю');
      } else {
        Movie.findByIdAndRemove(movieId)
          .orFail(() => new NotFoundError('Фильм с указанным id не существует'))
          .then((movieCurrentUser) => {
            res.send(movieCurrentUser);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('Карточка с указанным _id не найдена.'));
            } else {
              next(err);
            }
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};
