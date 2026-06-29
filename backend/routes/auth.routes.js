const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/notifications', AuthController.getNotifications);

module.exports = router;
