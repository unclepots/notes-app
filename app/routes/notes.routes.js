const router = require('express').Router();
const notes = require('../controllers/notes.controller');

// Check if logged in
const is_logged_in = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login/');
    }else{
        next();
    }
}

// All URIs start with /notes/

router.get('/', is_logged_in, notes.mainPage);

router.get('/all/', is_logged_in, notes.allNotes);

// Save to Routes
module.exports = router;