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
        res.send({
            action: 'all',
            payload: notes
        })
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: err,
        })
    });
}

exports.newNote = (req, res) => {
    
    Notes.create_new_note(req.user.id).then(note => {
        res.send({
            action: 'new',
            payload: note
        })
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: err,
        })
    });

}
















// const sanitize = require('sanitize');
// const sanitizer = sanitize();






// exports.new = (req, res) => {
//     const note = new Note({
//         title: "Untitled",
//         body: ""
//     });

//     note.save().then(new_note => {
//         res.redirect('/note/'+new_note._id);
//     })
// }

// exports.getAll = (req, res) => {
//     Note.find()
//         .then(notes => {
//             res.send(notes);
//         }).catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while retrieving notes."
//             });
//         });
// }

// exports.get = (req, res) => {
//     const note_id = sanitizer.value(req.params.note_id, "str");
//     Note.findById(note_id).then(note => {
//         if(!note){
//             res.status(404).send({
//                 message: "Note not found."
//             })
//         }else{
//             fs.readFile(path.join(__dirname + '/../../templates/note.html'), 'utf8', (err, note_template) => {
//                 if(err){
//                     res.status(500).send({
//                         message: err.message || "Error reading file."
//                     });
//                 }else{
//                     note_template = note_template.replace(/rep_title/gi, note.title);
//                     note_template = note_template.replace(/rep_body/gi, note.body);
//                     note_template = note_template.replace(/rep_note_id/gi, note._id);
//                     note_template = note_template.replace(/rep_color/gi, note.color || 'default');
//                     res.send(note_template);
//                 }
//             });
//         }
//     }).catch(err => {
//         res.status(500).send({
//             message: err.message || "Some error occurred while retrieving the note."
//         });
//     });
// }

// exports.update = (req, res) => {
//     const note_id = sanitizer.value(req.body.id, 'str');
//     const title = sanitizer.value(req.body.title, 'str');
//     const body = sanitizer.value(req.body.body, 'str');

//     Note.findByIdAndUpdate(note_id, {
//         title: title,
//         body: body
//     }).then(note => {
//         if(!note){
//             return res.status(404).send({
//                 message: "Note with id " + req.params.noteId + " not found."
//             });
//         }
//         res.send({message: "Note updated."});
//     }).catch(err => {
//         res.status(500).send({
//             message: err.message || "Some error occurred while updating the note."
//         });
//     });
// }

// exports.color = (req, res) => {
//     const note_id = sanitizer.value(req.body.id, 'str');
//     const color = sanitizer.value(req.body.color, 'str');

//     Note.findByIdAndUpdate(note_id, {
//         color: color
//     }).then(note => {
//         if(!note){
//             return res.status(404).send({
//                 message: "Note with id " + req.params.noteId + " not found."
//             });
//         }
//         res.send({message: "Note updated."});
//     }).catch(err => {
//         res.status(500).send({
//             message: err.message || "Some error occurred while updating the note."
//         });
//     });
// }