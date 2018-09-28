require('dotenv').config();

let db_name = process.env.DB_NAME || 'production';
let is_localhost = process.env.PORT == 4000 ? true : false;

let domain = is_localhost ? 'https://localhost:4000' : 'https://anatoly-notes-app.herokuapp.com';

module.exports = {
    is_localhost: is_localhost,
    google: {
        client_id: process.env.GOOGLE_ID,
        client_secret: process.env.GOOGLE_SECRET,
        callback: domain + "/auth/google/redirect"
    },
    facebook: {
        client_id: process.env.FACEBOOK_ID,
        client_secret: process.env.FACEBOOK_SECRET,
        callback: domain + "/auth/facebook/redirect"
    },
    session: {
        cookieKey: process.env.COOKIE_KEY
    },
    database:{
        url: 'mongodb+srv://' + process.env.DB_USER + ':' +  process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + db_name + '?retryWrites=true'
    }
}