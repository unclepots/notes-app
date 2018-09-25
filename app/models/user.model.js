const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    google: {
        id: String,
        email: String,
        profile_pic: String,
        display_name: String,
        first_name: String,
        last_name: String,
        gender: String,
        language: String
    }
});

module.exports = mongoose.model('user', userSchema);