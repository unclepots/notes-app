const Notes = require('../notes/notes');

exports.mainPage = (req, res) => {
    let notes = null;
    res.render('notes_main_container', {
        user: req.user,
        notes: notes,
    });
}

exports.allNotes = (req, res) => {
    
    Notes.get_user_notes(req.user.id).then(notes => {
        res.send(notes);
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: err,
        })
    });
}