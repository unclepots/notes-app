// Add Packages
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Import Auth Strategies
const passportSetup = require('./config/passport');

// Import Keys
const keys = require('./config/keys');

// If LOCALHOST enable Import Additional Packages
let https = null;
let fs = null;
let options = null;
let server = null;

if(keys.is_localhost){
    https = require('https');
    fs = require('fs');
    options = {
        key: fs.readFileSync( './localhost.key' ),
        cert: fs.readFileSync( './localhost.crt' ),
        requestCert: false,
        rejectUnauthorized: false
    };
}

// Initiate the App
const app = express();

// If LOCALHOST enable HTTPS
if(keys.is_localhost){
    server = https.createServer( options, app );
}

// Parse Requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Connecting to the DB
mongoose.connect(keys.database.url)
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

// Enable Cookies
app.use(cookieSession({
    maxAge: 30*24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use EJS Template System
app.set('view engine', 'ejs');

/* ENABLE URIs */

// Import Expternal Routes
const authRoutes = require('./app/routes/auth.routes.js');
const userRoutes = require('./app/routes/user.routes.js');
const notesRoutes = require('./app/routes/notes.routes.js');
const noteRoutes = require('./app/routes/note.routes.js');

// Static Routes
app.use(express.static(path.join(__dirname, 'public')));

// Homepage Route
app.get('/', (req, res) => {
    res.render('home', {user: req.user});
});

// External Routes
app.use('/auth/', authRoutes);
app.use('/user/', userRoutes);
app.use('/notes/', notesRoutes);
app.use('/note/', noteRoutes);

// Port Listening
if(keys.is_localhost){
    server.listen(process.env.PORT || 4000, () => {
        console.log("Server is listening on port: " + process.env.PORT || 4000);
    });
}else{
    app.listen(process.env.PORT || 4000, () => {
        console.log("Server is listening on port: " + process.env.PORT || 4000);
    });
}