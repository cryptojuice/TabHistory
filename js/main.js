var tabs = {};
var tabs_keys = [];


$('#saveButton').click(function(){
    saveCurrentTabs();
});

$('#clearTabs').click(function(){
    closeAllTabs();
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
    var datetime = moment().format("MMMM Do YYYY, h:mm:ss a");

    chrome.tabs.query({}, function(tab_array){
        for(var i = 0; i < tab_array.length; i++){
            temp_tabs[i] = 
                {
                    "title":tab_array[i].title,
                    "url":tab_array[i].url,
                    "favIconUrl":tab_array[i].favIconUrl
                };
        }
        tabs[datetime] = {"data": temp_tabs};
        tabs_keys[tabs_keys.length] = datetime;
        chrome.storage.local.set({'tabs':tabs}, function(){console.log('saved tabs');});
        chrome.storage.local.set({'tabs_keys': tabs_keys}, function(){console.log('saved keys');});
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
    $('#tabview').empty();
    for (var i=tabs_keys.length-1; i >= 0; i--){
        $('#tabview').append("<tr>"
                + "<td class='tabname'>" + tabs_keys[i] + "</td>"
                + "<td><div class='btn-group btn-group-xs'>"
                + "<button data-toggle='modal' href='#myModal' name='"+tabs_keys[i]+"' id='displayModal' class='btn btn-default btn-xs name='preview'><span class='glyphicon glyphicon-eye-open'> Preview</span></button>"
                + "<button type='button' class='btn btn-default btn-xs' name='restore' value='"+tabs_keys[i]+"'><span class='glyphicon glyphicon-folder-open'> Restore</span></button>"
                + "<button type='button' class='btn btn-danger btn-xs' name='remove' value='"+tabs_keys[i]+"'><span class='glyphicon glyphicon-trash'> Delete</span></button></div></td>"
                + "</tr>");
    }

    $('.tabname').hover(function(){
        $(this).toggleClass('active');
    });
    $('button').click(function(){
        var date = $(this).context.value;
        if($(this).context.name.toString() == "remove"){
            removeFromHistory(date);
        } else if($(this).context.name.toString() == "restore"){
            restoreTabs(date);
        }
    });

    $('#displayModal').show(function(){
        $('.modal-body').empty();
        var date = $(this).context.name;
        for (var i=0; i < len(tabs[date].data); i++){
            $('.modal-body').append('<li>'+tabs[date].data[i].title+'</li>');
        }
    });
};

loadTabHistory = function() {
    chrome.storage.local.get(['tabs','tabs_keys'],function(all){
        if(all.tabs && all.tabs_keys){
            tabs = all.tabs;
            tabs_keys = all.tabs_keys;
        }
        displaySavedTabs();
    });
};

restoreTabs = function(date) {
    for(var i=0; i < len(tabs[date].data); i++){
        chrome.tabs.create({"url":tabs[date].data[i].url});
    }
};

removeFromHistory = function(d) {
    var restoreDate = d.toString();
    var index = tabs_keys.indexOf(d);
    delete tabs[d];
    tabs_keys.splice(index, 1);
    chrome.storage.local.set({'tabs':tabs}, function(){console.log('saved tabs');});
    chrome.storage.local.set({'tabs_keys': tabs_keys}, function(){console.log('saved keys');});
    displaySavedTabs();
};

loadTabHistory();
