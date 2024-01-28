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
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "Raul", "Chavez", 1, "m.vandam@server.nl", "$2b$10$YvStlGG11fP.bQ37cslXYeehmzrisxzpd02L7tS6GMulNouO1f5lC", "Danes Lane", "city"),' +
  '(2, "Mechthild", "Heinrich", 0, "j.doe@server.com", "$2b$10$NCoDFmTRWDMcjBgZxfXBAetLIsTtsU77l/WswcKNYVluMpO99qRie", "Harvest Spring", "city");';

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Pasta Bolognese met tomaat, spekjes en kaas', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('User testcases for Share A Meal Database API', () => {
  // Information about before, after, beforeEach, afterEach:
  // https://mochajs.org/#hooks

  beforeEach((done) => {
    logger.debug('beforeEach called');
    dbconnection.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(CLEAR_DB + INSERT_USERS, (error, results, fields) => {
        connection.release();
        if (error) throw error;

        logger.debug('beforeEach done');
        done();
      });
    });
  });

  after((done) => {
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

  describe('UC-201 Add user /api/user', () => {
    it('TC-201-1 should return a valid error when a required input is missing', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          // Firstname is missing
          lastName: 'Brock',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'isaac.brock@example.com',
          password: '123',
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals('Please enter a valid first name');
          done();
        });
    });

    it('TC-201-2 should return a valid error when email address is invalid', (done) => {
      chai
        .request(server)
        .post('/api/user')
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

    it('TC-201-3 should return a valid error when password is invalid', (done) => {
      chai
        .request(server)
        .post('/api/user')
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

    it('TC-201-4 should return a valid error when user already exists', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          // Email already exists
          emailAdress: 'm.vandam@server.nl',
          password: 'secret',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(409);
          message.should.be
            .a('string')
            .that.equals(
              'EmailAdress m.vandam@server.nl is not valid or already exists'
            );
          done();
        });
    });

    it('TC-201-5 should successfully register a new user', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'Baguete',
          lastName: 'Fransoir',
          street: 'unique 61',
          city: 'unique',
          isActive: true,
          emailAdress: 'unique.unique@example.com',
          phoneNumber: '0647113041',
          password: 'unique',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.be.equal(201);
          result.firstName.should.equal('Baguete');
          done();
        });
    });
  });

  describe('UC-202 User overview /api/user', () => {
    it('TC-202-1 should return an empty array', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=asdfghdwoai')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(0);
          done();
        });
    });

    it('TC-202-2 should return an array with 2 users', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(2);
          result[0].firstName.should.equal('Raul');
          result[0].id.should.equal(1);
          done();
        });
    });

    it('TC-202-3 should return an empty array when searching for a non-existent name', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=feqofeqja')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(0);
          done();
        });
    });

    it(`TC-202-4 should return a filtered array by 'active' = false`, (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=false')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(1);
          result[0].isActive.should.equal(false);
          result[0].id.should.equal(2);
          done();
        });
    });

    it(`TC-202-5 should return a filtered array by 'active' = true`, (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=true')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(1);
          result[0].isActive.should.equal(true);
          result[0].id.should.equal(1);
          done();
        });
    });

    it('TC-202-6 should return a filtered array by name', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=mechthild')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(1);
          result[0].firstName.should.equal('Mechthild');
          result[0].id.should.equal(2);
          done();
        });
    });
  });

  describe('UC-203 Request user profile /api/user/profile', () => {
    it('TC-203-1 should return a valid error when token is invalid', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set(
          'authorization',
          'Beaaarer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
        )
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.equal('Invalid token or not authorized');
          done();
        });
    });

    it('TC-203-2 should return a valid array when token is valid', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.firstName.should.be.equal('Raul');
          done();
        });
    });
  });

  describe('UC-204 Request user details /api/user/:userId', () => {
    it('TC-204-1 should return a valid error when token is invalid', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set(
          'authorization',
          'Beaaarer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
        )
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.equal('Invalid token or not authorized');
          done();
        });
    });

    it('TC-204-2 should return a message that user does not exist', (done) => {
      chai
        .request(server)
        .get('/api/user/7')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.equal(`User with ID 7 does not exist`);
          done();
        });
    });

    it('TC-204-3 should return a filtered array by user Id', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');
          res.body.should.be.an('object').that.has.all.keys('result', 'status');
          let { status, result } = res.body;
          status.should.be.an('number');
          result.id.should.equal(1);
          done();
        });
    });
  });

  describe('UC-205 Update user details /api/user/:userId', () => {
    it('TC-205-1 should return a valid error when a required input is missing', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          // Firstname is missing
          lastName: 'Brock',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'm.vandam@server.nl',
          phoneNumber: '0612345678',
          password: '123',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals('Please enter a valid first name');
          done();
        });
    });

    it('TC-205-2 should return a valid error when city is invalid', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          // City is missing
          isActive: true,
          emailAdress: 'm.vandam@server.nl',
          password: 'secret',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be.a('string').that.equals('City is a required value');
          done();
        });
    });

    it('TC-205-3 should return a valid error when phone number is invalid', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'm.vandam@server.nl',
          password: 'secret',
          phoneNumber: '0425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be
            .a('string')
            .that.equals('PhoneNumber must be a Dutch number');
          done();
        });
    });

    it('TC-205-4 should not add user when user does not exist', (done) => {
      chai
        .request(server)
        .put('/api/user/6')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: 'notExisting.yes@example.com',
          password: 'secret',
          phoneNumber: '06 12425475',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be.a('string').that.equals('User does not exist');
          done();
        });
    });

    it('TC-205-5 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        // No Token
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.equal(
            'You have to be logged in to use this feature'
          );
          done();
        });
    });

    it('TC-205-6 should successfully update user', (done) => {
      chai
        .request(server)
        .put('/api/user/2')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          firstName: 'John',
          lastName: 'Doe',
          street: 'Street 61',
          city: 'Confusion',
          isActive: true,
          emailAdress: 'j.doe@server.com',
          password: 'secret',
          phoneNumber: '0689385719',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.be.equal(200);
          result.firstName.should.be.equal('John');
          done();
        });
    });
  });

  describe('UC-206 Delete user /api/user/:userId', () => {
    it('TC-206-1 should not delete user when user does not exist', (done) => {
      chai
        .request(server)
        .delete('/api/user/99')
        .set(
          'authorization',
          'Bearer ' + jwt.sign({ userId: 99 }, jwtSecretKey)
        )
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.equal('User does not exist');
          done();
        });
    });

    it('TC-206-2 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        // No Token
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.equal(
            'You have to be logged in to use this feature'
          );
          done();
        });
    });

    it('TC-206-3 should return a message that the user is not the owner', (done) => {
      chai
        .request(server)
        .delete('/api/user/2')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equal(403);
          message.should.be.equal(
            'You are not the owner of this user with Id: 2, therefore you do not have permission to delete it'
          );
          done();
        });
    });

    it('TC-206-4 should successfully delete the user', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equal(200);
          message.should.be.equal('Deleted user with Id: 1');
          done();
        });
    });
  });
});
