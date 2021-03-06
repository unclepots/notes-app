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

    document.getElementById('menu-toggle').addEventListener('click', function(){
        var body = document.querySelector('body');
        if(body.classList.contains('menu-open')){
            body.classList.remove('menu-open');
        }else{
            body.classList.add('menu-open');
        }
    })

});

const Notes = {
    main_container: null,

    notes_out: {},
        
    init: () => new Promise((resolve, reject) => {
        // Select Main Container
        Notes.main_container = document.getElementById('notes-container');
        
        // Bind Btns
        var btn = document.getElementById('add_new_note');
        
        btn.addEventListener('click', Notes.action.new);
        
        // Add Storage update event listener
        window.addEventListener('storage', Notes.local.callback)

        Notes.action.populate();

        resolve('Notes Initiated');

        Notes.bind('span.expand', 'click', Notes.action.expand);
        Notes.bind('span.external', 'click', Notes.action.external);
        Notes.bind('span.delete', 'click', Notes.action.delete);
        Notes.bind('span.focus_in', 'click', Notes.action.focus);
        
    }),

    action: {

        populate: () => new Promise((resolve, reject) => {

            Notes.server.getAll().then(notes => {

                var promises = [
                    Notes.local.populate(notes),
                    Notes.ui.populate(notes)
                ];

                Promise.all(promises).then(() => {
                    
                    const notesOut = localStorage.getItem('notes-out');
                    Notes.local.out.refresh(notesOut);

                    resolve('All notes loaded');
                }).catch(err => {
                    console.error(err);
                })

            }).catch(err => {
                console.log(err);
            })
            
        }),

        new: () => new Promise((resolve, reject) => {

            Notes.server.add().then(note => {
                
                var promises = [
                    Notes.local.add(note),
                    Notes.ui.add(note)
                ];

                Promise.all(promises).then(() => {
                    resolve();
                }).catch(err => {
                    console.error(err);
                })
            });

        }),

        expand: (e) => new Promise((resolve, reject) => {

            Notes.ui.open(e).then(() => {
                resolve();
            }).then(err => {
                console.error(err);
            });

        }),

        external: (e) => new Promise((resolve, reject) => {

            Notes.action.getNoteElement(e).then(target => {
                if(!target) return resolve();
                Notes.ui.open(target, true);
                resolve();
            });

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

            

            var promises = [
                Notes.local.delete(target.id),
                Notes.server.delete(target.id),
                Notes.ui.delete(target.id),
            ]

            Promise.all(promises).then(() => {
                resolve('Deleted');
            }).catch(err => {
                console.error(err);
            });

        }),

        focus: (e) => new Promise((resolve, reject) => {
            Notes.action.external(e).then(() => {
                resolve()
            }).catch(err => {
                console.error(err);
            });
        }),

        getNoteElement: (e) => new Promise((resolve, reject) => {
            var target = e.toElement;
            var found = false;
            
            while(!found){
                if(target.classList.contains('note')){
                    found = true;
                }else{
                    target = target.parentElement;
                }
                
            }

            if(!found) return resolve(null);
            return resolve(target);
        }),
    },

    local: {

        populate: (notes) => new Promise((resolve, reject) => {
            var key;
            var elem;

            var ids = [];

            notes.forEach(note => {
                ids.push(note._id);
                localStorage.setItem(note._id, JSON.stringify(note));
            });

            Notes.local.clean(ids);
            resolve();

        }),

        add: (note) => new Promise((resolve, reject) => {
            localStorage.setItem(note._id, JSON.stringify(note));
        }),

        delete: (id) => new Promise((resolve, reject) => {
            localStorage.removeItem(id);
            resolve();
        }),

        clean: (ids) => new Promise((resolve, reject) => {
            var key;
            var keys = [];

            var count = localStorage.length;

            ids.push('notes-out');

            for(var i = 0; i < count; i++){
                
                key = localStorage.key(i);

                if(!ids.includes(key)){
                    keys.push(key);
                }
            }

            keys.forEach(key => {
                localStorage.removeItem(key);
            })

        }),

        callback: (e) => new Promise((resolve, reject) => {
            if(e.isTrusted){
                if(e.key === 'notes-out'){
                    Notes.local.out.refresh(e.newValue);
                }else{
                    // const note_container = document.getElementById(e.key);
                    // const note = JSON.parse(e.newValue);
                    // if(note_container){
                    //     Notes.ui.update(note);
                    // }else{
                    //     Notes.ui.add(note);
                    // }
                }
            }
            resolve();
        }),

        out: {
            refresh: (value) => new Promise((resolve, reject) => {

                var ids = JSON.parse(value);

                var current = document.querySelectorAll('article.note.out');
                current.forEach(elem => {
                    elem.classList.remove('out');
                })

                ids.forEach(id => {
                    document.getElementById(id).classList.add('out');
                })

                resolve();
            }),

            update: (target, out = true) => new Promise((resolve, reject) => {
                var ids = localStorage.getItem('notes-out');
                var id = target.id;

                ids = JSON.parse(ids);
                if(ids == undefined) ids = [];

                if(out){
                    if(!ids.includes(id)){
                        ids.push(id);
                        target.classList.add('out');
                    }
                }else{
                    if(ids.includes(id)){
                        let index = ids.indexOf(id);
                        ids.splice(index, 1);
                        target.classList.remove('out');
                    }
                }

                ids = JSON.stringify(ids);

                localStorage.setItem('notes-out', ids);

                resolve();
            }),
        }
    },

    server: {

        getAll: () => new Promise((resolve, reject) => {
            
            var args = {
                endpoint: '/notes/all/',
                action: 'GET',
                payload: {}
            }
    
            Notes.server.request(args).then(data => {
                resolve(data);
            }).catch(err => {
                console.error(err);
            });

        }),

        add: () => new Promise((resolve, reject) => {

            const args = {
                endpoint: '/note/',
                action: 'PUT',
                payload: {}
            }
    
            Notes.server.request(args).then(note => {
                resolve(note);
            }).catch(err => {
                console.error(err);
                reject(err);
            });

        }),

        delete: (id) => new Promise((resolve, reject) => {

            const args = {
                endpoint: '/note/',
                action: 'DELETE',
                payload: {
                    id: id,
                }
            }

            Notes.server.request(args).then(res => {
                if(res.status === 'success'){
                    resolve();
                }else{
                    console.error(responce);
                    reject(responce);
                }
            }).catch(err => {
                console.error(err);
            })
        }),

        request: (args) => new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();

            req.onload = (e) => {
                if(e.target.readyState === 4){
                    resolve(JSON.parse(e.target.responseText));
                }
            };
    
            // Open connection
            req.open(args.action, args.endpoint, true);
    
            // Set headers
            req.setRequestHeader("Cache-Control", "no-cache");
            req.setRequestHeader('Content-Type', 'application/json');
    
            // Send Request
            req.send(JSON.stringify(args.payload));
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
    },

    ui: {

        populate: (notes) => new Promise((resolve, reject) => {

            var promises = [];

            notes.forEach(note => {
                promises.push(
                    Notes.ui.add(note).catch(err => {
                        console.error(err);
                    })
                );
            });

            Promise.all(promises).then(()=>{
                resolve();
            }).catch(err => {
                console.error(err);
            });

        }),

        add: (note) => new Promise((resolve, reject) => {
            
            const html = `<article id="${note._id}" class="note ${note.color}">
                <div class="content">
                    <h3 class="title">${note.title}</h3>
                    <div class="body">${note.body}</div>
                    <div class="hover">
                        <span class="hint expand" data-hint="Expand"><i class="fas fa-expand"></i></span>
                        <span class="hint external" data-hint="Open as separate"><i class="fas fa-external-link-square-alt"></i></span>
                        <span class="hint delete" data-hint="Delete note"><i class="fas fa-trash-alt"></i></span>
                    </div>
                    <div class="out">
                        <p>This note is out in a wild</p>
                        <span class="btn bring_back">Bring it <i class="fas fa-undo-alt"></i></span>
                        <span class="btn focus_in">Focus <i class="fas fa-search"></i></span>
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

        open: (target, external = false) => new Promise((resolve, reject) => {
            
            if(!target) return resolve();

            var url = '/note/'+target.id;
            var name = target.id;
            var args = 'left=100,top=100,width=500,height=500,menubar=no,location=no,resizable=yes,scrollbars=no,status=no';

            Notes.notes_out[name] = window.open(url, name, args);
            Notes.local.out.update(target);

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