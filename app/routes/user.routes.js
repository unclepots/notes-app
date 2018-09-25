// Import Packages
const router = require('express').Router();
const user = require('../controllers/user.controller.js');

// Check if logged in
const is_logged_in = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login/');
    }else{
        next();
    }
}

// All URIs start with /user/

// Root URI
router.get('/', is_logged_in, user.root);

// Profile URI
router.get('/profile/', is_logged_in, user.profile);

// Save to Routes
module.exports = router;