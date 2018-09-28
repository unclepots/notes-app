const NotesModel = require('../models/notes.model');
const collection = {};

collection.get_user_notes = (user_id) => new Promise((resolve, reject) => {
    NotesModel.find({
        owner: user_id,
    }).then(result => {
        resolve(result);
    }).catch(err => {
        console.error(err);
        reject();
    })
})

collection.create_new_note = (user_id) => new Promise((resolve, reject) => {
    
    var note = new NotesModel({
        owner: user_id,
        title: 'Untitled',
        body: '',
        color: 'default',
    });
    
    note.save().then(result => {
        resolve(result)
    }).catch(err => {
        console.error(err);
        reject();
    })
})

module.exports = collection;