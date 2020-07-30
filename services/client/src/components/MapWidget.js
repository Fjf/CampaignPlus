import React from "react";
import {dataService} from "./services/dataService";
import {IconButton} from "@material-ui/core"
import {FaArrowLeft} from "react-icons/all"

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function pAdd(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y};
}

function pSub(p1, p2) {
    return {x: p1.x - p2.x, y: p1.y - p2.y};
}

function pMul(p1, zoom) {
    return {x: p1.x * zoom, y: p1.y * zoom};
}

function clamp(d, l, u) {
    if (d < l) return l;
    if (d > u) return u;
    return d;
}

function Icons() {
    let _icons = {};
    let _filenames = ["position-marker"];
    this.load = function() {
        _filenames.forEach(name => {
            _icons[name] = new Image();
            _icons[name].src = `/static/images/icons/${name}.png`;
        })
    };

    this.get = function(name) {
        return _icons[name];
    };
}

function Map(c, w, h) {
    let context = c.getContext("2d");
    let width = c.width;
    let height = c.height;

    const markerWidth = 30;
    const markerHeight = 30;

    let zoom = 1;
    let isMousedown = false;
    let viewboxOffset = {x: 0, y: 0};
    let mouseDownPosition = {x: 0, y: 0};
    let previousMousePosition = {x: 0, y: 0};

    let moveThreshold = 5;
    let isMoving = false;

    function getMousePos(evt) {
        let rect = c.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getMarkerPosition(child) {
        return {
            x: (child.x - viewboxOffset.x) / zoom - markerWidth / 2,
            y: (child.y - viewboxOffset.y) / zoom - markerHeight
        }
    }

    function isCoordinateOnMarker(child, pos) {
        let markerPosition = getMarkerPosition(child);
        return pos.x > markerPosition.x && pos.x < markerPosition.x + markerWidth
            && pos.y > markerPosition.y && pos.y < markerPosition.y + markerHeight
    }

    function setVisibleMap(newMap) {
        let img = new Image();
        img.onload = () => {
            zoom = Math.max(img.width / width, img.height / height);
            newMap.defaultZoom = zoom;
        };
        img.src = newMap.map_url;
        newMap.image = img;

        // Make sure the child always knows how to get back to the parent.
        newMap.parent = visibleMap;

        visibleMap = newMap;
    }

    let maps = null;
    let visibleMap = null;
    this.setMap = function(new_map) {
        console.log(new_map);
        maps = new_map;
        setVisibleMap(new_map);
    };


    this.render = function() {
        if (visibleMap === null) return;

        // Clamp image to canvas boundary.
        let ww = visibleMap.image.width - width * zoom;
        let hh = visibleMap.image.height - height * zoom;
        if (ww < 0) {
            viewboxOffset.x = clamp(viewboxOffset.x, ww, 0);
        } else {
            viewboxOffset.x = clamp(viewboxOffset.x, 0, ww);
        }
        if (hh < 0) {
            viewboxOffset.y = clamp(viewboxOffset.y, hh, 0);
        } else {
            viewboxOffset.y = clamp(viewboxOffset.y, 0, hh);
        }

        context.clearRect(0, 0, width, height);
        context.drawImage(visibleMap.image, viewboxOffset.x, viewboxOffset.y,
            width * zoom, height * zoom, 0, 0, width, height);

        for (let i = 0; i < visibleMap.children.length; i++) {
            let child = visibleMap.children[i];
            let markerPosition = getMarkerPosition(child);
            context.drawImage(icons.get("position-marker"),
                markerPosition.x,
                markerPosition.y,
                markerWidth, markerHeight);
        }
    };

    this.onMouseScroll = function(event) {
        let diff = (event.deltaY * 0.02) * zoom;
        let nextZoom = zoom + diff;

        if (nextZoom < 0.1) return;
        if (nextZoom * width > visibleMap.image.width * 1.2 && nextZoom * height > visibleMap.image.height * 1.2) return;

        zoom = nextZoom;

        let pos = getMousePos(event);
        viewboxOffset.x -= pos.x * diff;
        viewboxOffset.y -= pos.y * diff;
        event.preventDefault();
    };

    this.onMouseDown = function(event) {
        isMousedown = true;

        mouseDownPosition = {x: event.x, y: event.y};
        previousMousePosition = {x: event.x, y: event.y};
    };

    this.onMouseUp = function(event) {
        isMousedown = isMoving = false;

        // Dont register clicks after moving more than N pixels.
        if (distance(mouseDownPosition, event) > moveThreshold)
            return;

        let pos = getMousePos(event);
        for (let i = 0; i < visibleMap.children.length; i++) {
            let child = visibleMap.children[i];
            if (isCoordinateOnMarker(child, pos)) {
                setVisibleMap(child);
            }
        }

    };


    this.onMouseMove = function(event) {
        if (isMoving ||
            (distance(mouseDownPosition, event) > moveThreshold && isMousedown)
        ) {
            viewboxOffset = pAdd(viewboxOffset, pMul(pSub(previousMousePosition, event), zoom));
            isMoving = true;
        }

        document.body.style.cursor = "default";
        let pos = getMousePos(event);
        for (let child of visibleMap.children) {
            if (isCoordinateOnMarker(child, pos)) {
                document.body.style.cursor = "pointer";
                break;
            }
        }

        previousMousePosition = {x: event.x, y: event.y};
    };

    this.hasParent = function() {
        return visibleMap !== null && visibleMap.parent_map_id !== null;
    };

    this.toParent = function() {
        if (this.hasParent()) {
            visibleMap = visibleMap.parent;
            zoom = visibleMap.defaultZoom;
        }
    };

    this.onKeyDown = function(event) {

    };
}

let map;
const icons = new Icons();
icons.load();

export default function MapWidget(props) {
    const campaign = props.campaign;


    React.useEffect(() => {
        const canvas = document.getElementById("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        map = new Map(canvas);

        canvas.addEventListener("mousedown", map.onMouseDown);
        document.addEventListener("mouseup", map.onMouseUp);
        document.addEventListener("mousemove", map.onMouseMove);
        canvas.addEventListener("wheel", map.onMouseScroll);
        canvas.addEventListener("keydown", map.onKeyDown);

        dataService.getMaps(campaign.id).then(r => {
            map.setMap(r);
        });

        setInterval(map.render, 1000 / 60);
    }, []);

    return <div className={"main-content"}>
        <canvas id={"canvas"} style={{backgroundColor: "white"}}/>
        <IconButton variant={"outlined"} color={"secondary"}
                    style={{top: "8px", left: "8px", position: "absolute"}}
                    aria-label="back" onClick={() => {
            map.toParent();
        }}>
            <FaArrowLeft/>
        </IconButton>
    </div>

}