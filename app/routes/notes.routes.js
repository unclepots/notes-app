module.exports = (app) => {
    const notes = require('../controllers/notes.controller.js');

    app.get("/note/new/", notes.new);
    app.get("/notes/", notes.getAll);
    app.get("/note/:note_id", notes.get);
    app.put("/note/", notes.update);
    app.put("/note/color/", notes.color);
}