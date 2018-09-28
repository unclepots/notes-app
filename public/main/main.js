// const Notes = {
//     add_new_note: document.getElementById("add-new-note"),
//     Notes_container: document.getElementById("Notes"),
//     opened_Notes: [],

//     init: function(){
//         // Create new note
//         this.add_new_note.addEventListener('click', (e) => {
//             this.open(location.origin + "/note/new");
//         });
//     },

//     get_Notes: function(){
//         const xhttp = new XMLHttpRequest();
//         xhttp.onreadystatechange = function(){
//             Notes.put_Notes(this);
//         };
//         xhttp.open("GET", location.origin + "/Notes/", true);
//         xhttp.send();
//     },

//     put_Notes: function(data){
//         if(data.readyState == 4 && data.status == 200){
//             if(data.response.indexOf('{') === 0 || data.response.indexOf('[') === 0){
//                 const res = JSON.parse(data.response);
//                 res.reverse();
//                 res.forEach(element => {
//                     this.put_note(element);
//                 });
//             }else{
//                 console.log(data.response);
//             }
//         }
//     },

//     put_note: function(note){
//         if(note.color === undefined){
//             note.color = "default";
//         }
//         const article = `
//         <article data-id="${note._id}" class="note ${note.color}" onclick="Notes.open_note(this)">
//             <h2 class="note-title">${note.title}</h2>
//             <p class="note-body">${note.body}</p>
//         <article>
//         `;
//         this.Notes_container.innerHTML += article;
//     },

//     open: function(url, id){
//         let opened = false;
//         this.opened_Notes.forEach(win => {
//             if(win.name === id){
//                 opened = true;
//             }
//         });
//         if(opened){
//             this.opened_Notes.forEach(win => {
//                 if(win.name === id){
//                     win.focus();
//                 }
//             });
//         }else{
//             this.opened_Notes.push(window.open(url, id, "width=350,height=350,top=350,left=350"));
//         }
//     },

//     open_note: function(data){
//        this.open(location.origin + "/note/" + data.dataset.id, data.dataset.id);
//     }
// }

window.addEventListener('load', (e) => {
    "use strict";
    console.log("Document Loaded");

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');

        console.log('Service Worker Registered');

        if(document.getElementById('notes-container')){
            console.log('notes container detected');
            Notes.init().then(data => {
                console.log(data);
            });
        }
        
    }else{
        console.log('Service Worker is not supported');
    }

});

const Notes = {
    main_container: null,

    init: () => new Promise((resolve, reject) => {
        // Select Main Container
        Notes.main_container = document.getElementById('notes-container');
        
        // Bind Btns
        var btn = document.getElementById('add_new_note');
        
        btn.addEventListener('click', Notes.action.new);
        
        // Add Storage update event listener
        window.addEventListener('storage', Notes.storage.local.callback)



        Notes.action.populate();

        resolve('Notes Initiated');
    }),

    action: {

        populate: () => new Promise((resolve, reject) => {
            
            var args = {
                endpoint: '/notes/all/',
                action: 'GET',
                payload: {}
            }
    
            Notes.storage.remote.request(args).then(() => {
                resolve();
            }).catch(err => {
                console.error(err);
            });
        }),

        new: () => new Promise((resolve, reject) => {
            console.log('Button "New" clicked');
            
            const args = {
                endpoint: '/notes/new/',
                action: 'POST',
                payload: {}
            }
    
            Notes.storage.remote.request(args).catch(err => {
                console.error(err);
            });

            resolve();
        }),

    },

    storage: {

        local: {

            add: (note) => new Promise((resolve, reject) => {
                localStorage.setItem(note._id, JSON.stringify(note));
            }),

            callback: (e) => new Promise((resolve, reject) => {
                if(e.isTrusted){
                    const note_container = document.getElementById(e.key);
                    const note = JSON.parse(e.newValue);
                    if(note_container){
                        Notes.ui.update(note);
                    }else{
                        Notes.ui.add(note);
                    }
                }
                resolve();
            }),
        },

        remote: {
            request: (args) => new Promise((resolve, reject) => {
                var req = new XMLHttpRequest();
    
                req.onload = Notes.storage.remote.callback;
        
                // Open connection
                req.open(args.action, args.endpoint, true);
        
                // Set headers
                req.setRequestHeader("Cache-Control", "no-cache");
                req.setRequestHeader('Content-Type', 'application/json');
        
                // Send Request
                req.send(JSON.stringify(args.payload));
        
                resolve('Request made');
            }),

            callback: (e) => {
                if(e.target.readyState !== 4){return;}
                
                var response = JSON.parse(e.target.responseText);
    
                switch(response.action){
                    case 'all':
                        Notes.update.all(response.payload);
                        break;
                    case 'new':
                        Notes.update.new(response.payload);
                        break;
                    default:
                        console.log(response);
                }
            },
        }
    },

    update: {
        all: (notes) => new Promise((resolve, reject) => {
            
            var promises = [];

            notes.forEach(note => {
                Notes.storage.local.add(note);
                var promise = Notes.ui.add(note);
                promises.push(promise);
            })

            Promise.all(promises).then(() => {
                resolve();
            }).catch(err => {
                console.error(err);
            })
        }),

        new: (note) => new Promise((resolve, reject) => {

            Notes.storage.local.add(note);
            
            Notes.ui.add(note).then(() => {
                resolve();
            }).catch(err => {
                console.error(err);
            })
        }),

    },

    ui: {
        add: (note) => new Promise((resolve, reject) => {
            
            const html = `<article id="${note._id}" class="note ${note.color}">
                <span class="close">X</span>
                <div class="content">
                    <div class="color-toolbar"></div>
                    <input class="title" type="text" placeholder="Title" value="${note.title}" />
                    <textarea class="body">${note.body}</textarea>
                    <div class="toolbar">
                        <div class="actions"></div>
                        <div class="status"></div>
                    </div>
                    <div class="hover">
                        <span class="expand">[ ]</div>
                    </div>
                </div>
            </article>`;

            Notes.main_container.innerHTML = html + Notes.main_container.innerHTML;

            Notes.ui.bind();
            resolve();
        }),

        update: (note) => new Promise((resolve, reject) => {
            var the_note = document.getElementById(note._id);
            
            the_note.querySelector('.title').innerHTML = note.title;
            the_note.querySelector('p').innerHTML = note.body;

            Notes.ui.bind();
            resolve();
        }),
        
        bind: () => new Promise((resolve, reject) => {
            
            var notes = document.querySelectorAll('article.note');
            
            notes.forEach(note => {
                var expand = note.querySelector('span.expand');
                var close = note.querySelector('span.close');

                expand.addEventListener('click', function(e){
                    var parent = this.parentElement.parentElement.parentElement;
                    if(!parent.classList.contains('open')){
                        parent.classList.add('open');
                    }
                });
                
                close.addEventListener('click', function(e){
                    e.target.parentElement.classList.remove('open')
                })
            });

            resolve();
        }),

        open: (e) => new Promise((resolve, reject) => {
            
            var note = null;

            for(var i = 0; i < e.path.length; i++){
                if(
                    e.path[i].nodeName === 'ARTICLE' &&
                    e.path[i].className.indexOf('note ') > -1
                ){
                    note = e.path[i];
                    i = e.path.length;
                }
            }

            console.log(this);
            resolve();
        }),
    },

}