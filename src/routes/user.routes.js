const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/authentication.controller');
const router = express.Router();

// Register user
router.post('/user', userController.validateUser, userController.addUser);

// Get all users
router.get('/user', authController.validateToken, userController.getAllUsers);

// Request current user profile
router.get(
  '/user/profile',
  authController.validateToken,
  userController.getProfileFromUser
);

// Get user by Id
router.get(
  '/user/:id',
  authController.validateToken,
  userController.getUserById
);

// Update user by Id
router.put(
  '/user/:id',
  authController.validateToken,
  userController.validateUserUpdate,
  userController.updateUserById
);

// Delete user by Id
router.delete(
  '/user/:id',
  authController.validateToken,
  userController.deleteUserById
);

module.exports = router;
