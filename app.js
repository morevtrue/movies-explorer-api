require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const { login, createUser } = require('./controllers/users');
const { validateUserBody, validateAuthentification } = require('./middlewares/validations');
const { errorHandler } = require('./middlewares/error-handler');
const auth = require('./middlewares/auth');
const { NotFoundError } = require('./errors/not-found-error');
const { MONGO_DB_URL, limiter } = require('./utils/config');

const { PORT = 3000, DB_URL = MONGO_DB_URL } = process.env;
const app = express();

app.use(cors({
  origin: 'https://movies-morevtrue.students.nomoredomainsicu.ru',
  credentials: true,
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.json());

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(requestLogger);
app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', validateUserBody, login);
app.post('/signup', validateAuthentification, createUser);

app.use(auth);
app.use('/', require('./routes/users'));
app.use('/', require('./routes/movies'));

app.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

app.use((req, res, next) => next(new NotFoundError('неправильно указан путь')));

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
