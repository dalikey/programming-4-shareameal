const express = require('express');
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/authentication.controller');
const router = express.Router();

// Register meal
router.post(
  '',
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);

// Get all meals
router.get('', mealController.getAllMeals);

// Get meal by id
router.get('/:id', mealController.getMealById);

// Update meal
router.put(
  '/:id',
  authController.validateToken,
  mealController.validateMealUpdate,
  mealController.updateMealById
);

// Delete meal
router.delete(
  '/:id',
  authController.validateToken,
  mealController.deleteMealById
);

// Participate in a meal
router.get(
  '/:id/participate',
  authController.validateToken,
  mealController.participateInAMeal
);

module.exports = router;
