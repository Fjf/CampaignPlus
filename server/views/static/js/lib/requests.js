function requestApiJsonData(api, requestType, data, callback) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status == 200)
                callback(JSON.parse(xmlHttp.response));
            else
                console.log("Something went wrong calling " + api)
        }
    }

    xmlHttp.open(requestType, api, true)
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(data))
}
