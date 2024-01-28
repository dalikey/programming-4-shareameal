process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';
process.env.LOGLEVEL = 'warn';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const dbconnection = require('../../src/database/dbconnection');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, logger } = require('../../src/config/config');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USERS =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "Raul", "Chavez", "m.vandam@server.nl", "$2b$10$ijxZyv.AqBM4DA7wL5aKkOr//HQa6lX/dOhbzpS/z6VjuNPKfLOky", "Danes Lane", "city");' +
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(2, "Mechthild", "Heinrich", 0, "j.doe@server.com", "$2b$10$iYZD8AwQlgN0W2MwwBz/r.5kXjxsvWEl82VoDJCUIzPpAec7zgJO6", "Harvest Spring", "city");' +
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(3, "Charles", "Mackay", 0, "thirduser@server.nl", "$2b$10$iYZD8AwQlgN0W2MwwBz/r.5kXjxsvWEl82VoDJCUIzPpAec7zgJO6", "Crakell Road", "city");' +
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(4, "Mestan", "Baturalp", 0, "fourthuser@server.nl", "$2b$10$iYZD8AwQlgN0W2MwwBz/r.5kXjxsvWEl82VoDJCUIzPpAec7zgJO6", "Moorside Warren", "city");';

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Pasta Bolognese met tomaat, spekjes en kaas', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Login testcases for Share A Meal Database API', () => {
  // Information about before, after, beforeEach, afterEach:
  // https://mochajs.org/#hooks

  beforeEach((done) => {
    logger.debug('beforeEach called');
    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(
        CLEAR_DB + INSERT_USERS + INSERT_MEALS,
        (error, results, fields) => {
          connection.release();
          if (error) throw error;

          logger.debug('beforeEach done');
          done();
        }
      );
    });
  });

  describe('UC-101 Login /api/auth/login', () => {
    it('TC-101-1 should return a valid error when a required input is missing', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'Isaac',
          lastName: 'Brock',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          //Email address is missing
          password: '123',
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals('Please enter an email address');
          done();
        });
    });

    it('TC-101-2 should return a valid error when email address is invalid', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'iaacdqxample.com',
          password: 'secret',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals('Email address is required, and must be valid');
          done();
        });
    });

    it('TC-101-3 should return a valid error when password is invalid', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'isaac.brock@example.com',
          password: '1',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals(
              'Password is required, and must be at least 3 characters long'
            );
          done();
        });
    });

    it('TC-101-4 should return a valid error when user does not exist', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          // Email does not exist
          emailAdress: 'notExisting@server.nl',
          password: 'secret',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a('string')
            .that.equals('User not found or password invalid');
          done();
        });
    });

    it('TC-101-5 should successfully log the user in', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'Raul',
          lastName: 'Chavez',
          street: 'Danes Lane',
          city: 'city',
          isActive: true,
          emailAdress: 'm.vandam@server.nl',
          phoneNumber: '0647113041',
          password: 'secret',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.be.equal(200);
          result.firstName.should.equal('Raul');
          result.token.should.contain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.');
          done();
        });
    });
  });
});
