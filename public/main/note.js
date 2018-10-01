const Note = {
    mainContainer: document.getElementById('note'),
    toolbarHandle: document.getElementById('toolbar-handle'),

    init: (e) => new Promise((resolve, reject) => {
        
        Note.id = Note.mainContainer.dataset.id;

        Note.bind('span#toolbar-handle', 'click', Note.tools.toolbarTogle);

        
        Note.local.out.update(Note.id, true).then(() => {
            e.returnValue = null;
            resolve();
        });

        resolve();
    }),

    destroy: (e) => new Promise((resolve, reject) => {
        e.preventDefault();
        e.returnValue = '';

        Note.local.out.update(Note.id, false).then(() => {
            e.returnValue = null;
            resolve();
        });

    }),

    action: {
        
    },

    tools: {
        toolbarTogle: (e) => new Promise((resolve, reject) => {
            if(Note.mainContainer.classList.contains('toolbar-open')){
                Note.mainContainer.classList.remove('toolbar-open')
            }else{
                Note.mainContainer.classList.add('toolbar-open')
            }
        }),
    },

    local: {

        out: {
            update: (id, out = true) => new Promise((resolve, reject) => {

                var ids = localStorage.getItem('notes-out');

                ids = JSON.parse(ids);
                if(ids == undefined) ids = [];

                if(out){
                    if(!ids.includes(id)){
                        ids.push(id);
                    }
                }else{
                    if(ids.includes(id)){
                        let index = ids.indexOf(id);
                        ids.splice(index, 1);
                    }
                }

                ids = JSON.stringify(ids);

                localStorage.setItem('notes-out', ids);

                resolve();
            }),
        }
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

window.onload = Note.init();
window.onbeforeunload = Note.destroy;



// jQuery(document).ready(function($){
//     "use strict";
//     window.updateNote = null;
//     console.log("Note loaded.");

//     $('input#note-title').keyup(function(){
//         note.title = $.trim($(this).val());
//         note.update();
//     });

//     $('textarea#note-body').keyup(function(){
//         note.body = $(this).val();
//         note.update();
//     });

//     $('div#settings').click(function(){
//         if($('main#main-container').hasClass("settings_opened")){
//             $('main#main-container').removeClass("settings_opened");
//         }else{
//             $('main#main-container').addClass("settings_opened");
//         }
//     });

//     $('div.color').click(function(){
//         $(this).attr('class').split(' ').forEach(cls => {
//             if(cls != 'color'){
//                 note.change_color(cls);
//             }
//         });
//     });
// });

// const note = {
//     id: $('body').data("note-id"),
//     title: $('input#note-title').val(),
//     body: $('textarea#note-body').val(),
//     updating: null,

//     update: function(){
//         if(this.updating != null){
//             clearTimeout(this.updating);
//         }
        
//         document.title = this.title;

//         this.updating = setTimeout(function(){
//             this.updating = null,
//             note.update_note();
//         }, 1000);
//     },

//     update_note: function(){
//         const _note = JSON.stringify({
//             id: this.id,
//             title: this.title,
//             body: this.body
//         });

//         const xhttp = new XMLHttpRequest();
//         xhttp.onreadystatechange = function(){note.note_updated(this)};
//         xhttp.open("PUT", location.origin + "/note/", true);
        
//         xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//         xhttp.send(_note);
//     },

//     note_updated: function(data){
//         if(data.readyState == 4 && data.status == 200){
//             if(data.response.indexOf('{') === 0){
//                 const res = JSON.parse(data.response);
//                 console.log(res.message);
//             }else{
//                 console.log(data.response);
//             }
//         }
//     },

//     change_color: function(color){
//         $("main#main-container").removeClass("default red pink purple blue yellow");
//         $("main#main-container").addClass(color);

//         const _note = JSON.stringify({
//             id: this.id,
//             color: color
//         });

//         const xhttp = new XMLHttpRequest();

//         xhttp.onreadystatechange = function(){note.note_updated(this)};
//         xhttp.open("PUT", location.origin + "/note/color/", true);

//         xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//         xhttp.send(_note);
        
//         setTimeout(function(){
//             $("main#main-container").removeClass("settings_opened");
//         },300);
//     }
// }