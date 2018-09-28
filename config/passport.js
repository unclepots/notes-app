// Import Packages
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');

// Import Keys
const keys = require('./keys');

// Import User Model
const User = require('../app/models/user.model');

// Set Session Token
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Get Session Token
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    })
});

// Google Strategy
passport.use(
    new GoogleStrategy({
        callbackURL: keys.google.callback,
        clientID: keys.google.client_id,
        clientSecret: keys.google.client_secret
    },
    (accessToken, refreshToken, profile, done) => {

        User.findOne({
            'google.id': profile.id
        }).then(current_user => {
            if(current_user){
                console.log("old user");
                done(null, current_user);
            }else{
                console.log("new user");
                const img = profile._json.image.url.split('?');

                const user = new User({
                    google: {
                        id: profile.id,
                        email: profile.emails[0].value,
                        profile_pic: img[0],
                        display_name: profile.displayName,
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                    },
                    role: "user"
                });
        
                user.save().then(new_user => {
                    done(null, new_user);
                }).catch(err => {
                    done(err, null);
                });
            }
        }).catch(err => {
            done(err, null);
        });
    })
);

// Facebook Strategy
passport.use(
    new FacebookStrategy({
        callbackURL: keys.facebook.callback,
        clientID: keys.facebook.client_id,
        clientSecret: keys.facebook.client_secret,
        profileFields: ['id', 'displayName', 'first_name', 'last_name', 'email', 'ProfilePictureSource']
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        return;
        User.findOne({
            'google.id': profile.id
        }).then(current_user => {
            if(current_user){
                console.log("old user");
                done(null, current_user);
            }else{
                console.log("new user");
                const img = profile._json.image.url.split('?');

                const user = new User({
                    google: {
                        id: profile.id,
                        email: profile.emails[0].value,
                        profile_pic: img[0],
                        display_name: profile.displayName,
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                        language: profile._json.language,
                        gender: profile._json.gender
                    },
                    role: "user"
                });
        
                user.save().then(new_user => {
                    done(null, new_user);
                }).catch(err => {
                    done(err, null);
                });
            }
        }).catch(err => {
            done(err, null);
        });
    })
);