chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.restoreTabs === true){
        restoreTabs(request.tabs, request.key);
    }else if(request.closeTabs === true){
        closeTabs();
    }
});

restoreTabs = function(tabs, key){
    var size = Object.keys(tabs[key].data).length;

    for(var i=0; i < size; i++){
        var url = tabs[key].data[i].url;
        chrome.tabs.create({"url":url});
    }
    console.log(key + " " + "Restored");
};

closeTabs = function(wid){
    chrome.tabs.query({}, function(tabs){
        for(var i in tabs){
            chrome.tabs.remove(tabs[i].id, wid);
        }
    });
};
