// mapping antara nama endpoint & methodnya dengan entry point logic
const express = require('express');
const controller = require('../controllers/userController');

const userRouter = express.Router();

userRouter.post('/register', controller.register);
userRouter.post('/login', controller.login);

module.exports = userRouter;