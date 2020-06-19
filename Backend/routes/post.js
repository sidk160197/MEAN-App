const express = require('express');

const postController = require('../controller/post');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/posts', postController.getPosts);

router.post('/post', checkAuth, postController.addPost);

router.delete('/post/:id', checkAuth, postController.deletePost);

router.put('/post/:id', checkAuth, postController.editPost);

router.get('/post/:id', postController.getPost);

module.exports = router;