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
  '(1, "Raul", "Chavez", "m.vandam@server.nl", "$2b$10$iYZD8AwQlgN0W2MwwBz/r.5kXjxsvWEl82VoDJCUIzPpAec7zgJO6", "Danes Lane", "city");' +
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

describe('Meal testcases for Share A Meal Database API', () => {
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

  describe('UC-301 Create meal /api/meal', () => {
    it('TC-301-1 should return a valid error when a required input is missing', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          // Name is missing
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: [],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be.a('string').that.equals('Name is a required value');
          done();
        });
    });

    it('TC-301-2 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        // No Token
        .send({
          name: 'Pasta Bolognese met tomaat, spekjes en kaas',
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'noten', 'lactose'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
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

    it('TC-301-3 should successfully create a new meal', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey))
        .send({
          name: 'Pasta Bolognese met tomaat, spekjes',
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'noten'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(201);
          res.should.be.an('object');

          res.body.should.be
            .an('object')
            .that.has.all.keys('status', 'result', 'message');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.name.should.equal('Pasta Bolognese met tomaat, spekjes');
          done();
        });
    });
  });

  describe('UC-302 Update meal /api/meal', () => {
    it(`TC-302-1 should return a valid error when a mandatory field 'name' and/or 'price' and/or 'maxAmountOfParticipants' are missing`, (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          // name: 'Pasta Bolognese met tomaat, spekjes en kaas',
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'noten', 'lactose'],
          // maxAmountOfParticipants: 4,
          // price: 12.75,
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(400);
          message.should.be.a('string').that.equals('Name is a required value');
          done();
        });
    });

    it('TC-302-2 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        // No Token
        .send({
          name: 'Pasta Bolognese met tomaat, spekjes en kaas',
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'noten', 'lactose'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
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

    it('TC-302-3 should return a message that the user is not the owner', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 4 }, jwtSecretKey))
        .send({
          name: 'Pasta Bolognese met tomaat, spekjes en kaas',
          description:
            'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['noten', 'lactose'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(403);
          message.should.be
            .a('string')
            .that.equals(
              'You are not the owner of this meal, therefore you do not have permission to delete it'
            );
          done();
        });
    });

    it('TC-302-4 should not update meal when meal does not exist', (done) => {
      chai
        .request(server)
        .put('/api/meal/6')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          name: `I dont exist`,
          description: 'Nothing',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'noten', 'lactose'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.a('string').that.equals('Meal does not exist');
          done();
        });
    });

    it('TC-302-5 should successfully update meal', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send({
          name: 'Pasta Bolognese met friet',
          description:
            'Een heerlijke nieuwkomer! Altijd goed voor tevreden gesmikkel!',
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          dateTime: '2022-05-16T18:30:51.154Z',
          imageUrl:
            'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
          allergenes: ['gluten', 'lactose'],
          maxAmountOfParticipants: 4,
          price: 12.75,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an('object');

          res.body.should.be
            .an('object')
            .that.has.all.keys('status', 'result', 'message');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.name.should.equal('Pasta Bolognese met friet');
          done();
        });
    });
  });

  describe('UC-303 Request a list of meals /api/meal', () => {
    it('TC-303-1 should return list of meals', (done) => {
      chai
        .request(server)
        .get('/api/meal')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          let { status, result } = res.body;
          status.should.be.an('number');
          result.should.be.an('array').that.has.length(2);
          result[0].name.should.equal(
            'Pasta Bolognese met tomaat, spekjes en kaas'
          );
          result[0].id.should.equal(1);
          done();
        });
    });
  });

  describe('UC-304 Request meal details /api/meal', () => {
    it('TC-304-1 should return a message that meal does not exist', (done) => {
      chai
        .request(server)
        .get('/api/meal/7')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.equal(`Meal with ID 7 does not exist`);
          done();
        });
    });

    it('TC-304-2 should return a filtered array by meal Id', (done) => {
      chai
        .request(server)
        .get('/api/meal/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');
          res.body.should.be.an('object').that.has.all.keys('result', 'status');
          let { status, result } = res.body;
          status.should.be.an('number');
          result.id.should.equal(1);
          result.name.should.be.equal(
            `Pasta Bolognese met tomaat, spekjes en kaas`
          );
          done();
        });
    });
  });

  describe('UC-305 Request meal details /api/meal', () => {
    it('TC-305-2 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .delete('/api/meal/6')
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

    it('TC-305-3 should return a message that the user is not the owner', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 4 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(403);
          message.should.be
            .a('string')
            .that.equals(
              'You are not the owner of this meal, therefore you do not have permission to delete it'
            );
          done();
        });
    });

    it('TC-305-4 should return a message that the meal does not exist', (done) => {
      chai
        .request(server)
        .delete('/api/meal/6')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.a('string').that.equals('Meal does not exist');
          done();
        });
    });

    it('TC-305-5 should successfully delete meal', (done) => {
      chai
        .request(server)
        .delete('/api/meal/2')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(200);
          message.should.be.equal('Deleted meal with Id: 2');
          done();
        });
    });
  });

  describe('UC-401 Sign up for meal /api/meal/:id/participate', () => {
    it('TC-401-1 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .get('/api/meal/1/participate')
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

    it('TC-401-2 should return a message that meal does not exist', (done) => {
      chai
        .request(server)
        .get('/api/meal/99/participate')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.a('string').that.equals('Meal does not exist');
          done();
        });
    });

    it('TC-401-3 should return a message that user successfully registered', (done) => {
      chai
        .request(server)
        .get('/api/meal/1/participate')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.be.equal(200);
          result.mealId.should.equal(1);
          result.userId.should.equal(1);
          done();
        });
    });
  });

  describe('UC-402 Signing out for the meal /api/meal/:id/participate', () => {
    it('TC-402-1 should return a message that user is not logged in', (done) => {
      chai
        .request(server)
        .get('/api/meal/1/participate')
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

    it('TC-402-2 should return a message that meal does not exist', (done) => {
      chai
        .request(server)
        .get('/api/meal/99/participate')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.be.equal(404);
          message.should.be.a('string').that.equals('Meal does not exist');
          done();
        });
    });

    it('TC-402-3 should return a message that user signed out', (done) => {
      chai
        .request(server)
        .get('/api/meal/1/participate')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.be.equal(200);
          result.mealId.should.equal(1);
          result.userId.should.equal(1);
          done();
        });
    });
  });
});
