// Import Packages
const User = require('../models/user.model');

exports.root = (req, res) => {
    res.redirect('/auth/profile/');
}

exports.profile = (req, res) => {
    res.render('profile', {
        user: req.user
    });
}