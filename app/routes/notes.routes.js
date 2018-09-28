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

router.post('/new/', is_logged_in, notes.newNote);

// Save to Routes
module.exports = router;





// module.exports = (app) => {
//     const notes = require('../controllers/notes.controller.js');

//     app.get("/note/new/", notes.new);
//     app.get("/notes/", notes.getAll);
//     app.get("/note/:note_id", notes.get);
//     app.put("/note/", notes.update);
//     app.put("/note/color/", notes.color);
// }