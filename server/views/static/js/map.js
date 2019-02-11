let canvas = document.getElementById("map");
canvas.height = 1080
canvas.width = 1920

canvas.addEventListener('wheel', function(event){
    if (event.deltaY < 0) {
        zoomIn(event);
    } else {
        zoomOut(event);
    }
    event.preventDefault();
    return false;
}, false);

canvas.addEventListener('click', function(event) {

    event.preventDefault();
    return false;
}, false);


function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;


function zoomIn(e) {
    let zoomPercent = 0.1;
    zoomCentre = canvas.relMouseCoords(e);

    newWidth = currentMap.width * (1 - zoomPercent);
    newHeight = currentMap.height * (1 - zoomPercent);

    diffX = currentMap.width - newWidth;
    diffY = currentMap.height - newHeight;

    xPercent = zoomCentre.x / canvas.clientWidth;
    yPercent = zoomCentre.y / canvas.clientHeight;

    currentMap.x += diffX * xPercent;
    currentMap.y += diffY * yPercent;

    currentMap.width = newWidth;
    currentMap.height = newHeight;

    currentMap.draw();
}

function zoomOut(e) {
    let zoomPercent = 0.1;
    zoomCentre = canvas.relMouseCoords(e);

    newWidth = currentMap.width * 1 / (1 - zoomPercent);
    newHeight = currentMap.height * 1 / (1 - zoomPercent);

    diffX = currentMap.width - newWidth;
    diffY = currentMap.height - newHeight;

    xPercent = zoomCentre.x / canvas.clientWidth;
    yPercent = zoomCentre.y / canvas.clientHeight;

    currentMap.x += diffX * xPercent;
    currentMap.y += diffY * yPercent;

    currentMap.width = newWidth;
    currentMap.height = newHeight;

    currentMap.draw();
}

function resize() {
    currentMap.resize();
    currentMap.draw();
}


function isInRectangle(pos, x, y, width, height) {
    return pos.x < x + width && pos.x > x && pos.y < y + height && pos.y > y;
}


canvas.onclick = function(e) {
    if (curAction == actions.placeMarker) {
        pos = canvas.relMouseCoords(e);

        pos.x = currentMap.width * pos.x / canvas.clientWidth + currentMap.x;
        pos.y = currentMap.height * pos.y / canvas.clientHeight + currentMap.y;

        currentMap.markers.push({x: pos.x, y: pos.y});

        curAction = actions.none;
        document.getElementById("select_map_x").value = Math.round(pos.x);
        document.getElementById("select_map_y").value = Math.round(pos.y);
        document.getElementById("select_map_pid").value = currentMap.id;
        document.getElementById("select_map").style.display = "block";
    } else if (curAction == actions.move) {
        pos = canvas.relMouseCoords(e);

        pos.x = currentMap.width * pos.x / canvas.clientWidth;
        pos.y = currentMap.height * pos.y / canvas.clientHeight;

        let i;
        if((i = currentMap.isInMarker(pos)) != -1) {
            loadMap(i)
        }
    }
}

canvas.onmousedown = function(e) {
    if (curAction == actions.move) {
        currentMap.startMoveEvent = e;
    }
}

function moveMap(e) {
    currentMap.x += currentMap.startMoveEvent.x - e.x;
    currentMap.y += currentMap.startMoveEvent.y - e.y;

    currentMap.draw();
    currentMap.startMoveEvent = e;
}

function addMarker() {
    curAction = actions.placeMarker;
}

canvas.onmousemove = function(e) {
    if (curAction == actions.move && currentMap.startMoveEvent != null) {
        moveMap(e)
    } else if (curAction == actions.placeMarker) {
        pos = canvas.relMouseCoords(e);

        newMarker.x = canvas.width * pos.x / canvas.clientWidth;
        newMarker.y = canvas.height * pos.y / canvas.clientHeight;

        // Redraw map so you dont see snaking marker.
        currentMap.draw();
        newMarker.draw();
    }
}

document.onmouseup = function(e) {
    if (curAction == actions.move && currentMap.startMoveEvent != null) {
        currentMap.startMoveEvent = null;
    }
}


let context = canvas.getContext("2d")


let currentMap = {
    img: new Image(),
    id: 0,
    parent_id: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    startMoveEvent: null,
    markers: [],
    markerWidth: 40,
    markerHeight: 40,
    markerImg: new Image(),
    draw: function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, canvas.width, canvas.height)

        xScale = (canvas.width / this.width);
        yScale = (canvas.height / this.height);
        for (pos of this.markers) {

            relativeX = (pos.x - this.x) * xScale - this.markerWidth / 2;
            relativeY = (pos.y - this.y) * yScale - this.markerHeight;

            // Dont draw the marker if it is out of bounds.
            if (relativeX + this.markerWidth < 0 || relativeX > canvas.width ||
                relativeY + this.markerHeight < 0 || relativeY > canvas.height)
            {
                continue;
            }
            context.drawImage(this.markerImg, relativeX, relativeY, this.markerWidth, this.markerHeight);
        }
    },
    resize: function() {
        let ratio = canvas.width / canvas.height;
        let imgRatio = this.img.width / this.img.height;

        if (ratio <= imgRatio) {
            // Horizontal white border top and bottom.
            this.width = this.img.width;
            this.height = (this.img.width / ratio);

            this.x = 0;
            this.y = -(this.height - this.img.height) / 2
        } else {
            // Vertical white border left and right.
            this.width = (this.img.height / (1/ratio));
            this.height = this.img.height;

            this.x = -(this.width - this.img.width) / 2
            this.y = 0;
        }
    },
    isInMarker: function(loc) {
        xScale = (canvas.width / this.width);
        yScale = (canvas.height / this.height);

        loc.x *= xScale;
        loc.y *= yScale;
        for (pos of this.markers) {

            relativeX = (pos.x - this.x) * xScale - this.markerWidth / 2;
            relativeY = (pos.y - this.y) * yScale - this.markerHeight;

            if (isInRectangle(loc, relativeX, relativeY, this.markerWidth, this.markerHeight))
                return pos.id;
        }
        return -1;
    }
};


let currentMarker = {

}

let newMarker = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    img: new Image(),
    draw: function() {
        context.drawImage(this.img, this.x - this.width / 2, this.y - this.height, this.width, this.height);
    }
}
newMarker.img.src = "/static/images/base/marker.png";
currentMap.markerImg.src = "/static/images/base/marker.png";

let actions = {
    placeMarker: 3,
    move: 4
}

let curAction = actions.move;

function setMapData(map_id) {
    name = document.getElementById("map_name").value;
    story = document.getElementById("map_story").value;

    document.getElementById("button_update").disabled = true;

    let func = function(data) {
        document.getElementById("button_update").disabled = false;
        if (!data.success) {
            console.log("Something went wrong updating map data.")
            console.log("Error: " + data.error);
            return
        }
    }

    let data = {
        playthrough_id: PLAYTHROUGH_ID,
        map_id: map_id,
        name: name,
        story: story
    }

    requestApiJsonData("/api/updatemapdata", "POST", data, func)
}


function updateMapData() {
    setMapData(currentMap.id);
}


function createSetMapData(map_id) {
    return function() { setMapData(map_id); }
}

function createLoadMap(i) {
    return function() { loadMap(i); }
}


function loadMap(map_id) {
    // TODO: If map_id is -1, the base map will be loaded.
    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong retrieving the map.");
            return;
        }
        currentMap.img = new Image();
        currentMap.img.src = data.image;
        currentMap.id = data.id;
        currentMap.parent_id = data.parent_id;
        currentMap.markers = [];

        let div;
        let places = document.getElementById("places");
        places.innerHTML = "";

        // Add information about this map.
        console.log(data);
        document.getElementById("map_name").value = data.map_name;
        document.getElementById("map_story").innerHTML = data.map_story;

        if (data.parent_id != "") {
            div = document.createElement("div");
            div.classList.add("custom_button")
            div.innerHTML = "Parent map";
            div.addEventListener("click", createLoadMap(currentMap.parent_id), false);
            places.appendChild(div);
        }

        div = document.createElement("div");
        div.classList.add("custom_button")
        div.innerHTML = "Currently opened map";
        div.addEventListener("click", createLoadMap(currentMap.id), false);
        places.appendChild(div);

        for (marker of data.markers) {
            currentMap.markers.push({x: marker.x, y: marker.y, id: marker.id});

            div = document.createElement("div");
            div.classList.add("custom_button")

            div.addEventListener("click", createLoadMap(marker.id), false);

            if (marker.name == "")
                marker.name = "Unmarked location";

            div.innerHTML = marker.name + " {" + marker.x + ", " + marker.y + "}.";
            places.appendChild(div);
        }

        currentMap.img.onload = function(e) {
            currentMap.resize();

            currentMap.draw();
        }
    }

    data = {
        playthrough_id: PLAYTHROUGH_ID,
        map_id: map_id
    }

    requestApiJsonData("/api/getmap", "POST", data, func)
}


function selectMap() {
    let func = function(data) {
        document.getElementById("submit_selected").disabled = false;
        if (!data.success) {
            console.log("Something went wrong uploading the map.")
            console.log("The following error was thrown: " + data.error)
            return
        }
        document.getElementById("select_map").style.display = "none";

        loadMap(currentMap.id)
    }

    parent_id = currentMap.id;
    x = 1 * document.getElementById("select_map_x").value
    y = 1 * document.getElementById("select_map_y").value
    id = 1 * document.getElementById("select_map_id").value

    if (name == "") {
        console.log("Map title may not be empty")
        return
    }

    data = {
        map_id: id,
        x: x,
        y: y,
        parent_id: parent_id
    }

    console.log(data)

    requestApiJsonData("/api/updatemapdata", "POST", data, func)
    document.getElementById("submit_selected").disabled = true;
}

function createMap() {
    let func = function(data) {
        document.getElementById("map_submit").disabled = false;
        if (!data.success) {
            console.log("Something went wrong uploading the map.")
            console.log("The following error was thrown: " + data.error)
            return
        }
        document.getElementById("create_map").style.display = "none";

        loadMap(5)
        getAllMaps()
    }

    parent_id = currentMap.id;
    name = document.getElementById("create_map_title").value
    file = document.getElementById("create_map_file").files[0]

    if (name == "") {
        console.log("Map title may not be empty")
        return
    }

    var formdata = new FormData();
    formdata.append('file', file);
    formdata.append('playthrough_id', PLAYTHROUGH_ID)
    formdata.append('name', name);


    requestApiFormData("/api/uploadmap", "POST", formdata, func)
    document.getElementById("map_submit").disabled = true;
}

function getAllMaps() {
    let func = function(data) {
        console.log(data)
        if (!data.success) {
            console.log("Something went wrong retrieving maps.")
            return
        }

        function createSelectMapName(div) {
            return function() {
                document.getElementById("select_map_name").value = div.innerHTML;
                document.getElementById("select_map_id").value = div.value;
            }
        }

        if (data.maps.length == 0)
            alert("It seems this is the first time you are here. Please note that the first map you upload will become the base map image.")

        document.getElementById("create_map_maplist").innerHTML = ""
        for (map of data.maps) {
            li = document.createElement("li");
            li.value = map.map_id
            li.innerHTML = map.map_name

            li.addEventListener("click", createSelectMapName(li), false);

            document.getElementById("create_map_maplist").appendChild(li);
        }
    }

    data = {
        playthrough_id: PLAYTHROUGH_ID
    }


    requestApiJsonData("/api/getmaps", "POST", data, func)
}

loadMap(5)
getAllMaps()


