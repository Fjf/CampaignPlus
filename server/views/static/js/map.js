let canvas = document.getElementById("map");
canvas.width = 1920
canvas.height = 1080
let context = canvas.getContext("2d")


let currentMap = {
    img: new Image(),
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    startMoveEvent: null,
    draw: function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, canvas.width, canvas.height)
    }
};

let curAction = 4;

let actions = {
    zoomIn: 1,
    zoomOut: 2,
    placeMarker: 3,
    move: 4,
    none: 5
}

function loadMap(map_id) {
    // If map_id is -1, the base map will be loaded.

    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong retrieving the background image");
            return;
        }
        currentMap.img = new Image();
        currentMap.img.src = data.image;

        currentMap.img.onload = function(e) {
            currentMap.width = currentMap.img.width;
            currentMap.height = currentMap.img.height;
            currentMap.draw();
        }
    }

    data = {
        playthrough_id: PLAYTHROUGH_ID,
        map_id: map_id
    }

    requestApiJsonData("/api/getmap", "POST", data, func)
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


loadMap()

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

    newWidth = currentMap.width * 1/(1 - zoomPercent);
    newHeight = currentMap.height * 1/(1 - zoomPercent);

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
    currentMap.x = 0;
    currentMap.y = 0;
    currentMap.width = currentMap.img.width;
    currentMap.height = currentMap.img.height;
    currentMap.draw();
}


canvas.onclick = function(e) {
    if (curAction == actions.zoomIn) {
        zoomIn(e);
    } else if (curAction == actions.zoomOut) {
        zoomOut(e);
    }
}

canvas.onmousedown = function(e) {
    if (curAction == actions.move) {
        currentMap.startMoveEvent = e;
    }
}

function moveMap(e) {
    currentMap.x -= currentMap.startMoveEvent.x - e.x;
    currentMap.y -= currentMap.startMoveEvent.y - e.y;

    currentMap.draw();
    currentMap.startMoveEvent = e;
}

canvas.onmousemove = function(e) {
    if (curAction == actions.move && currentMap.startMoveEvent != null) {
        moveMap(e)
    }
}

document.onmouseup = function(e) {
    if (curAction == actions.move && currentMap.startMoveEvent != null) {
        currentMap.startMoveEvent = null;
    }
}
