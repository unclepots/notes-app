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

        Notes.bind('span.expand', 'click', Notes.action.expand);
        Notes.bind('span.close', 'click', Notes.action.close);
        Notes.bind('span.delete', 'click', Notes.action.delete);
        
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
            
            const args = {
                endpoint: '/note/',
                action: 'PUT',
                payload: {}
            }
    
            Notes.storage.remote.request(args).catch(err => {
                console.error(err);
            });

            resolve();
        }),

        expand: (e) => new Promise((resolve, reject) => {

            var target = e.toElement;
            var found = false;

            while(!found){
                if(target.classList.contains('note')){
                    found = true;
                }else{
                    target = target.parentElement;
                }
                
            }

            if(!found) return false;

            target.classList.add('open');
            

            resolve();
        }),

        close: (e) => new Promise((resolve, reject) => {

            var target = e.toElement;
            var found = false;
            
            while(!found){
                if(target.classList.contains('note')){
                    found = true;
                }else{
                    target = target.parentElement;
                }
                
            }

            if(!found) return false;

            target.classList.remove('open');
            

            resolve();

        }),

        delete: (e) => new Promise((resolve, reject) => {

            var confirmed = window.confirm('Are you sure you want to delete this note?');

            if(!confirmed) return false;

            var target = e.toElement;
            var found = false;
            
            while(!found){
                if(target.classList.contains('note')){
                    found = true;
                }else{
                    target = target.parentElement;
                }
                
            }

            if(!found) return false;

            const args = {
                endpoint: '/note/',
                action: 'DELETE',
                payload: {
                    id: target.id,
                }
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

            delete: (id) => new Promise((resolve, reject) => {
                localStorage.removeItem(id);
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
                    case 'delete':
                        Notes.update.delete(response.payload);
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

        delete: (id) => new Promise((resolve, reject) => {

            var promises = [
                Notes.storage.local.delete(id),
                Notes.ui.delete(id)
            ];

            Promise.all(promises).then(() => {
                console.log('Note removed');
            }).catch(err => {
                console.error(err);
            })

        }),

    },

    ui: {
        add: (note) => new Promise((resolve, reject) => {
            
            const html = `<article id="${note._id}" class="note ${note.color}">
                <span class="close"><i class="fas fa-times"></i></span>
                <div class="content">
                    <div class="color-toolbar"></div>
                    <input class="title" type="text" placeholder="Title" value="${note.title}" />
                    <textarea class="body">${note.body}</textarea>
                    <div class="toolbar">
                        <div class="actions"></div>
                        <div class="status"></div>
                    </div>
                    <div class="hover">
                        <span class="hint expand" data-hint="Expand"><i class="fas fa-expand"></i></span>
                        <span class="hint external" data-hint="Open as separate"><i class="fas fa-external-link-square-alt"></i></span>
                        <span class="hint delete" data-hint="Delete note"><i class="fas fa-trash-alt"></i></span>
                    </div>
                </div>
            </article>`;

            Notes.main_container.innerHTML = html + Notes.main_container.innerHTML;

            resolve();
        }),

        update: (note) => new Promise((resolve, reject) => {
            var the_note = document.getElementById(note._id);
            
            the_note.querySelector('.title').innerHTML = note.title;
            the_note.querySelector('p').innerHTML = note.body;

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

            resolve();
        }),

        delete: (id) => new Promise((resolve, reject) => {
            
            var note = document.getElementById(id);

            note.classList.add('deleted');

            setTimeout(function(){
                note.parentNode.removeChild(note);
            }, 700);

            resolve();
        }),
    },

    bind: (selector, eventType, callback, context) => new Promise((resolve, reject) => {

        (context || document).addEventListener(eventType, function(event){
            
            var nodeList = document.querySelectorAll(selector);

            // convert nodeList into matches array
            var matches = [];
            for(var i = 0; i < nodeList.length; ++i){
                matches.push(nodeList[i]);
            }

            // if there are matches
            if(matches){
                var element = event.target;
                var found = false;

                // traverse up the DOM tree until element can't be found in matches array
                while(element && !found){
                    if(matches.indexOf(element) === -1){
                        element = element.parentElement;
                    }else{
                        found = true;
                    }
                }

                // when element matches the selector, apply the callback
                if(found){
                    callback.call(element, event);
                }
            }
        }, false);

        resolve();
    }),
}