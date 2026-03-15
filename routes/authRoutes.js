const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth'); 
const { signup, login, getMe } = require('../controllers/authController');


router.get('/me', auth, getMe);
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;