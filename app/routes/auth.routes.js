const router = require('express').Router();
const auth = require('../controllers/auth.controller');

// All URIs start with /auth/

// Root URI
router.get('/', auth.root);

// Login URI
router.get('/login/', auth.login);

// Google OAuth URI
router.get('/google/', auth.google);

// Google Redirect URI
router.get('/google/redirect/', auth.google_redirect);

// Facebook OAuth URI
router.get('/facebook/', auth.facebook);

// Facebook Redirect URI
router.get('/facebook/redirect/', auth.facebook_redirect);

// Logout URI
router.get('/logout/', auth.logout);

// Save to Routes
module.exports = router;