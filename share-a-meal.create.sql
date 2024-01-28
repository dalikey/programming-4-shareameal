-- 
-- Use this script to create your local database, and your test database.
-- NOTE: You must be logged in as root to run this script.
-- This script creates the database, the user, and opens the new database.
-- Then you can import the share-a-meal.sql script.
-- In the connection settings you then use the new database, the user and the password.
-- 
DROP DATABASE IF EXISTS `share-a-meal`;
CREATE DATABASE `share-a-meal`;
DROP DATABASE IF EXISTS `share-a-meal-testdb`;
CREATE DATABASE `share-a-meal-testdb`;
-- Creating share-a-meal-user
CREATE USER 'share-a-meal-user'@'localhost' IDENTIFIED BY 'secret';
CREATE USER 'share-a-meal-user'@'%' IDENTIFIED BY 'secret';
-- Give rights to the user
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'%';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'%';

USE `share-a-meal`; 