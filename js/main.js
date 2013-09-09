var tabs = {};

$('#saveButton').click(function(){
    saveCurrentTabs();
});

$('#closeTabs').click(function(){
    chrome.runtime.sendMessage({"closeTabs":true});
});

$('#myModal').on('hidden.bs.modal', function () {
    $(this).removeData('bs.modal');
});

$(document.body).on('click', '#displayModal', function(){
    $('#myModal').modal('show');
    $('.modal-body').empty();
    var key = $(this).context.value;
    var size = Object.keys(tabs[key].data).length;
    $('.modal-body').append(
        '<table class="table-bordered table-condenced">'+
        '<tbody id="tabcontent">'+
        '</tbody>'+
        '</table>'
        );

    for (var i=0; i < size; i++){
        $('#tabcontent').append(
            '<tr>'+
            '<td><img src="'+tabs[key].data[i].favIconUrl+'"</img></td>'+
            '<td>'+tabs[key].data[i].title+'</td>'+
            '</tr>'
            );
    }
});

$(document.body).on('blue keyup paste', '#editable', function(){
    var key = $(this).attr('name');
    tabs[key].th_description = $(this).html();
    chrome.storage.local.set({'tabs':tabs}, function(){console.log(key + ' saved');});
});

$(document.body).on('click', '#closeWindow', function(){
    window.close();
});


len = function(obj){
    var size = 0;
    for(var i in obj){
        ++size;
    }
    return size;
};

saveCurrentTabs = function(){
    var temp_tabs = {};
    var key = moment().format("l hh:mm:ss A");

    chrome.tabs.query({}, function(tab_array){
        for(var i = 0; i < tab_array.length; i++){
            temp_tabs[i] = 
                {
                    "title":tab_array[i].title,
                    "url":tab_array[i].url,
                    "favIconUrl":tab_array[i].favIconUrl,
                };
        }
        tabs[key] = {"data": temp_tabs, "th_description":"click to edit"};
        chrome.storage.local.set({'tabs':tabs}, function(){console.log(key + ' saved');});
        displaySavedTabs();
    });
};

closeAllTabs = function(){
    chrome.tabs.query({}, function(tabs){
        for(var i in tabs){
            if (tabs[i].url != "chrome://newtab/"){
                chrome.tabs.remove(tabs[i].id);
            }
        }
    });
};

displaySavedTabs = function(){
    var keys = Object.keys(tabs);
    $('#tabview').empty();
    for (var i=keys.length-1; i >= 0; i--){
        $('#tabview').append(
                "<tr>"+
                "<td id='editable' contenteditable='true' name='"+keys[i]+"'>"+tabs[keys[i]].th_description+"</td>"+
                "<td class='tabname'>" + keys[i] + "</td>"+
                "<td><div class='btn-group btn-group-xs'>"+
                "<button data-toggle='modal' data-target='myModal' value='"+keys[i]+"' id='displayModal' class='btn btn-default btn-xs' name='preview'><span class='glyphicon glyphicon-eye-open'> Preview</span></button>"+
                "<button type='button' class='btn btn-default btn-xs' name='restore' value='"+keys[i]+"'><span class='glyphicon glyphicon-folder-open'> Restore</span></button>"+
                "<button type='button' class='btn btn-danger btn-xs' name='remove' value='"+keys[i]+"'><span class='glyphicon glyphicon-trash'> Delete</span></button></div></td>"+
                "</tr>"
                );
    }

    $('.tabname').hover(function(){
        $(this).toggleClass('active');
    });

    $('button').click(function(){
        var key = $(this).context.value;
        if($(this).context.name == "remove"){
            removeFromHistory(key);
        } else if($(this).context.name == "restore"){
            restoreTabs(key);
        }
    });

//    $(document.body).on('click', '#displayModal', function(){
//        $('#myModal').modal('show');
//        $('.modal-body').empty();
//        var key = $(this).context.name;
//        var size = Object.keys(tabs[key].data).length;
//
//        for (var i=0; i < size; i++){
//            $('.modal-body').append('<li>'+tabs[key].data[i].title+'</li>');
//        }
//    });
};

loadTabHistory = function() {
    chrome.storage.local.get('tabs',function(stored_tabs){
        if(stored_tabs.tabs){
            tabs = stored_tabs.tabs;
        }
        displaySavedTabs();
    });
};

restoreTabs = function(key) {
    chrome.runtime.sendMessage({"restoreTabs":true, "tabs":tabs, "key":key});
};

removeFromHistory = function(key) {
    delete tabs[key];
    chrome.storage.local.set({'tabs':tabs}, function(){console.log('saved tabs');});
    displaySavedTabs();
};


loadTabHistory();
