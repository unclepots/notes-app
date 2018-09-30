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

collection.create = (user_id) => new Promise((resolve, reject) => {
    
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

collection.delete = (user_id, note_id) => new Promise((resolve, reject) => {

    NotesModel.findById(note_id).then(note => {
        if(note.owner == user_id){
            NotesModel.deleteOne(note).then(() => {
                resolve(note_id);
            }).catch(err => {
                console.error(err);
                reject();
            })
        }else{
            reject({
                error: 'You don\'t have permissions to delete this Note'
            })
        }
    }).catch(err => {
        console.error(err);
        reject();
    })

})

module.exports = collection;