let context = document.getElementById("map").getContext("2d")

function loadMap(map_id) {
    // If map_id is -1, the base map will be loaded.

    let func = function(data) {

        x = document.createElement("IMG")
        x.src = data

        context.drawImage(x, 0, 0)
    }

    data = {
        playthrough_id: PLAYTHROUGH_ID,
        map_id: map_id
    }

    requestImageData("/api/getmap", "POST", data, func)
}

function requestImageData(api, requestType, data, callback) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status == 200)
                callback(xmlHttp.response);
            else
                console.log("Something went wrong calling " + api);
        }
    }

    xmlHttp.open(requestType, api, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(data));
}

function uploadMap() {
    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong uploading the map.")
            console.log("The following error was thrown: " + data.error)
            return
        }

        loadMap()
    }

    parent_id = document.getElementById("map_pid").value
    x = document.getElementById("map_x").value
    y = document.getElementById("map_y").value
    file = document.getElementById("map_file").files[0]

    console.log(file)

    var formdata = new FormData();
    formdata.append('file', file);
    formdata.append('playthrough_id', PLAYTHROUGH_ID)
    formdata.append('parent_id', parent_id)
    formdata.append('x', x)
    formdata.append('y', y)


    requestApiFormData("/api/uploadmap", "POST", formdata, func)
}


