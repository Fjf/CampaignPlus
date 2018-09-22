let canvas = document.getElementById("map");
canvas.width = 1920
canvas.height = 1080
let context = canvas.getContext("2d")


let currentMap = {
    img: new Image(),
    id: 0,
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
newMarker.img.src = "/static/images/marker.png";
currentMap.markerImg.src = "/static/images/marker.png";

let actions = {
    zoomIn: 1,
    zoomOut: 2,
    placeMarker: 3,
    move: 4,
    none: 5
}

let curAction = actions.none;

function loadMap(map_id) {
    // If map_id is -1, the base map will be loaded.

    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong retrieving the background image");
            return;
        }
        currentMap.img = new Image();
        currentMap.img.src = data.image;
        currentMap.id = data.id;
        currentMap.markers = [];

        for (marker of data.markers) {
            currentMap.markers.push({x: marker.x, y: marker.y, id: marker.id});
        }

        currentMap.img.onload = function(e) {
            let ratio = canvas.width / canvas.height;
            let imgRatio = currentMap.img.width / currentMap.img.height;

            console.log(ratio)
            console.log(imgRatio)

            if (ratio <= imgRatio) {
                // Horizontal white border top and bottom.
                currentMap.width = currentMap.img.width;
                currentMap.height = (currentMap.img.width / ratio);

                currentMap.x = 0;
                currentMap.y = -(currentMap.height - currentMap.img.height) / 2
            } else {
                // Vertical white border left and right.
                currentMap.width = (currentMap.img.height / (1/ratio));
                currentMap.height = currentMap.img.height;

                currentMap.x = -(currentMap.width - currentMap.img.width) / 2
                currentMap.y = 0;
            }

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
        document.getElementById("map_submit").disabled = false;
        if (!data.success) {
            console.log("Something went wrong uploading the map.")
            console.log("The following error was thrown: " + data.error)
            return
        }
        document.getElementById("upload_map").style.display = "none";

        loadMap()
    }

    parent_id = currentMap.id;
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

    console.log("Parent map id: " + parent_id)

    requestApiFormData("/api/uploadmap", "POST", formdata, func)
    document.getElementById("map_submit").disabled = true;
}


loadMap(3)

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


function isInRectangle(pos, x, y, width, height) {
    return pos.x < x + width && pos.x > x && pos.y < y + height && pos.y > y;
}


canvas.onclick = function(e) {
    if (curAction == actions.zoomIn) {
        zoomIn(e);
    } else if (curAction == actions.zoomOut) {
        zoomOut(e);
    } else if (curAction == actions.placeMarker) {
        pos = canvas.relMouseCoords(e);

        pos.x = currentMap.width * pos.x / canvas.clientWidth;
        pos.y = currentMap.height * pos.y / canvas.clientHeight;

        currentMap.markers.push({x: pos.x, y: pos.y});

        curAction = actions.none;
        document.getElementById("map_x").value = Math.round(pos.x);
        document.getElementById("map_y").value = Math.round(pos.y);
        document.getElementById("map_pid").value = currentMap.id;
        document.getElementById("upload_map").style.display = "block";
    } else if (curAction == actions.none) {
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
    currentMap.x -= currentMap.startMoveEvent.x - e.x;
    currentMap.y -= currentMap.startMoveEvent.y - e.y;

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
