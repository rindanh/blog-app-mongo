// mapping antara nama endpoint & methodnya dengan entry point logic
const express = require('express');
const controller = require('../controllers/blogController');
const { authenticated } = require('../middlewares/auth')

const blogRouter = express.Router();

blogRouter.get('/all', controller.getAll);
blogRouter.get('/:postId', controller.getByPostId);
blogRouter.post('/create', authenticated, controller.create)
blogRouter.get('/:postId/publish', authenticated, controller.publish)

module.exports = blogRouter;