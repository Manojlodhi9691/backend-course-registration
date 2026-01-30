const express = require('express');
const router = express.Router();
// Changed this line to destructure auth from the object we exported
const { auth } = require('../middleware/auth'); 
const { signup, login, getMe } = require('../controllers/authController');

// All paths here are prefixed with /api/auth (from your index.js)
router.get('/me', auth, getMe);
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;