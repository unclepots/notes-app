const passport = require('passport');

// Redirect to login screen
exports.root = (req, res) => {
    res.redirect('/auth/login/');
}

// Render Login Page
exports.login = (req, res) => {
    res.render('login', {user: req.user});
}

// Login with Google
exports.google = passport.authenticate('google',{
    scope: ['profile', 'email']
});

// Google Callback
exports.google_redirect = [passport.authenticate('google'), (req, res) => {
    res.redirect('/user/profile/');
}];

// Login with Facebook
exports.facebook = passport.authenticate('facebook',{
    scope: ['email']
});

// Facebook Callback
exports.facebook_redirect = [passport.authenticate('facebook'), (req, res) => {
    res.redirect('/user/profile/');
}];

// Logout
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/auth/login/');
}