require('dotenv').config();

// SSL on Localhost
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync( './localhost.key' ),
    cert: fs.readFileSync( './localhost.crt' ),
    requestCert: false,
    rejectUnauthorized: false
};

// Add Packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// INitiate the App
const app = express();
const server = https.createServer( options, app );
// Parse Requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// DB Configuration
const dbConfig = require('./config/database.config.js');

// Connecting to the DB
mongoose.connect(dbConfig.url)
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

// Homepage Path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/templates/index.html'));
});

// Manifest Path
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname + '/manifest.json'));
});

// JS and CSS Resources
app.get('/main/:name', (req, res) => {
    const filename = req.params.name;
    res.sendFile(path.join(__dirname + '/main/' + filename));
});

// Favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname + '/favicon.ico'));
});

// Settings Icon
app.get('/images/settings_icon.svg', (req, res) => {
    res.sendFile(path.join(__dirname + '/images/settings_icon.svg'));
});
// Checkmark
app.get('/images/color_selected.svg', (req, res) => {
    res.sendFile(path.join(__dirname + '/images/color_selected.svg'));
});

// Other icons
app.get('/images/icons/:icon', (req, res) => {
    let icon_name = req.params.icon;
    res.sendFile(path.join(__dirname + '/images/icons/' + icon_name));
});

// Service Worker
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/service-worker.js'));
});

require('./app/routes/notes.routes.js')(app);

// Port Listening
server.listen(process.env.PORT || 4000, () => {
    console.log("Server is listening on port: " + process.env.PORT || 4000);
});