const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    title: String,
    body: String,
    color: String,
    shared: [{
        person: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        level: Number,
    }]
},{
    timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema);