import React from "react";


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

function Map(c, w, h) {
    let context = c.getContext("2d");
    let width = w;
    let height = h;

    let zoom = 1;
    let isMousedown = false;
    let viewboxOffset = {x: 0, y: 0};
    let mouseDownPosition = {x: 0, y: 0};
    let previousMousePosition = {x: 0, y: 0};

    let moveThreshold = 20;

    let visibleMap = new Image();
    visibleMap.src = "/static/images/deba018e57cca6ec573f88c9b27af832.jpg";

    function getMousePos(evt) {
        let rect = c.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    this.render = function() {
        context.clearRect(0, 0, width, height);
        context.drawImage(visibleMap, viewboxOffset.x, viewboxOffset.y,
            width * zoom, height * zoom, 0, 0, width, height);
    };

    this.onMouseScroll = function(event) {
        let diff = event.deltaY * 0.02;
        let nextZoom = zoom + diff;

        if (nextZoom < 0) return;
        if (nextZoom * width > visibleMap.width + 100 && nextZoom * height > visibleMap.height + 100) return;

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
        isMousedown = false;

        // Dont register clicks after moving more than N pixels.
        if (distance(mouseDownPosition, event) > moveThreshold)
            return;

    };

    this.onMouseMove = function(event) {
        if (distance(mouseDownPosition, event) > moveThreshold && isMousedown) {
            viewboxOffset = pAdd(viewboxOffset, pMul(pSub(previousMousePosition, event), zoom));
        }

        previousMousePosition = {x: event.x, y: event.y};
    };

    this.onKeyDown = function(event) {

    };
}

let map;
export default function MapWidget(props) {
    const [maps, setMaps] = React.useState(null);

    React.useEffect(() => {
        const canvas = document.getElementById("canvas");
        map = new Map(canvas, props.width, props.height);

        canvas.width = props.width;
        canvas.height = props.height;
        canvas.addEventListener("mousedown", map.onMouseDown);
        canvas.addEventListener("mouseup", map.onMouseUp);
        canvas.addEventListener("mousemove", map.onMouseMove);
        canvas.addEventListener("wheel", map.onMouseScroll);
        canvas.addEventListener("keydown", map.onKeyDown);

        setInterval(map.render, 1000 / 60);
    }, []);

    return <div>
        <canvas id={"canvas"}/>
    </div>

}