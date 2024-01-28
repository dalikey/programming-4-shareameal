const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const infoRouter = require('./src/routes/info.routes');
const authRouter = require('./src/routes/authentication.routes');
const userRouter = require('./src/routes/user.routes');
const mealRouter = require('./src/routes/meal.routes');
const logger = require('./src/config/config').logger;

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} called`);
  next();
});

app.use('/', infoRouter);
app.use('/api/auth', authRouter);
// Neccessary refactor for bcrypt
app.use('/api', userRouter);
app.use('/api/meal', mealRouter);

app.all('*', (req, res, next) => {
  const error = {
    status: 401,
    result: 'End-point not found',
  };
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  logger.debug('Error handler called.');
  res.status(err.status).json(err);
});

app.listen(port, () => {
  logger.debug(`Programmeren-4-shareameal app listening on port ${port}`);
});

process.on('SIGINT', () => {
  logger.debug('SIGINT signal received: closing HTTP server');
  dbconnection.end((err) => {
    logger.debug('Database connection closed');
  });
  app.close(() => {
    logger.debug('HTTP server closed');
  });
});

module.exports = app;
