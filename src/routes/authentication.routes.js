const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller');
const router = express.Router();

router.post('/login', authController.validateLogin, userController.login);

module.exports = router;
