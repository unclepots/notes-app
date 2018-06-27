jQuery(document).ready(function($){
    "use strict";
    console.log("Document Ready");

    notes.init();
    notes.get_notes();
});

const notes = {
    add_new_note: document.getElementById("add-new-note"),
    notes_container: document.getElementById("notes"),
    opened_notes: [],

    init: function(){
        // Create new note
        this.add_new_note.addEventListener('click', (e) => {
            this.open(location.origin + "/note/new");
        });
    },

    get_notes: function(){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            notes.put_notes(this);
        };
        xhttp.open("GET", location.origin + "/notes/", true);
        xhttp.send();
    },

    put_notes: function(data){
        if(data.readyState == 4 && data.status == 200){
            if(data.response.indexOf('{') === 0 || data.response.indexOf('[') === 0){
                const res = JSON.parse(data.response);
                res.reverse();
                res.forEach(element => {
                    this.put_note(element);
                });
            }else{
                console.log(data.response);
            }
        }
    },

    put_note: function(note){
        if(note.color === undefined){
            note.color = "default";
        }
        const article = `
        <article data-id="${note._id}" class="note ${note.color}" onclick="notes.open_note(this)">
            <h2 class="note-title">${note.title}</h2>
            <p class="note-body">${note.body}</p>
        <article>
        `;
        this.notes_container.innerHTML += article;
    },

    open: function(url, id){
        let opened = false;
        this.opened_notes.forEach(win => {
            if(win.name === id){
                opened = true;
            }
        });
        if(opened){
            this.opened_notes.forEach(win => {
                if(win.name === id){
                    win.focus();
                }
            });
        }else{
            this.opened_notes.push(window.open(url, id, "width=350,height=350,top=350,left=350"));
        }
    },

    open_note: function(data){
       this.open(location.origin + "/note/" + data.dataset.id, data.dataset.id);
    }
}

window.addEventListener('load', (e) => {
    "use strict";
    console.log("Document Loaded");

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker Registered');
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    console.log("beforeinstallprompt event Fired");
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();

    // Stash the event so it can be triggered later.
    window.deferredPrompt = e;

    document.getElementById("add-to-home-banner").style.visibility = 'visible';
    document.getElementById("add-to-home-banner").classList.add('open');

    let add_to_home = document.getElementById('add-to-home');
    add_to_home.addEventListener('click', (m) => {
        console.log("Button Clicked.");

        m.preventDefault();
        window.deferredPrompt.prompt();

        window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('App installed.');
        } else {
            console.log('App install cancelled.');
        }
        window.deferredPrompt = null;
        });
    });
});