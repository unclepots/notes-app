jQuery(document).ready(function($){
    "use strict";
    window.updateNote = null;
    console.log("Note loaded.");

    $('input#note-title').keyup(function(){
        note.title = $.trim($(this).val());
        note.update();
    });

    $('textarea#note-body').keyup(function(){
        note.body = $(this).val();
        note.update();
    });

    $('div#settings').click(function(){
        if($('main#main-container').hasClass("settings_opened")){
            $('main#main-container').removeClass("settings_opened");
        }else{
            $('main#main-container').addClass("settings_opened");
        }
    });

    $('div.color').click(function(){
        $(this).attr('class').split(' ').forEach(cls => {
            if(cls != 'color'){
                note.change_color(cls);
            }
        });
    });
});

const note = {
    id: $('body').data("note-id"),
    title: $('input#note-title').val(),
    body: $('textarea#note-body').val(),
    updating: null,

    update: function(){
        if(this.updating != null){
            clearTimeout(this.updating);
        }
        
        document.title = this.title;

        this.updating = setTimeout(function(){
            this.updating = null,
            note.update_note();
        }, 1000);
    },

    update_note: function(){
        const _note = JSON.stringify({
            id: this.id,
            title: this.title,
            body: this.body
        });

        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){note.note_updated(this)};
        xhttp.open("PUT", location.origin + "/note/", true);
        
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(_note);
    },

    note_updated: function(data){
        if(data.readyState == 4 && data.status == 200){
            if(data.response.indexOf('{') === 0){
                const res = JSON.parse(data.response);
                console.log(res.message);
            }else{
                console.log(data.response);
            }
        }
    },

    change_color: function(color){
        $("main#main-container").removeClass("default red pink purple blue yellow");
        $("main#main-container").addClass(color);

        const _note = JSON.stringify({
            id: this.id,
            color: color
        });

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function(){note.note_updated(this)};
        xhttp.open("PUT", location.origin + "/note/color/", true);

        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(_note);
        
        setTimeout(function(){
            $("main#main-container").removeClass("settings_opened");
        },300);
    }
}