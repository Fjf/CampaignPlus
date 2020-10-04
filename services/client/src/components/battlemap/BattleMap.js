import React from "react";
import socketIOClient from "socket.io-client";

const CAMPAIGN_NAME = "Testing";

let lineColour = {value: "555555"};
let lineRadiusSlider = {value: 10};

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

function pMin(p1, p2) {
    return {x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y)};
}

function pMax(p1, p2) {
    return {x: Math.max(p1.x, p2.x), y: Math.max(p1.y, p2.y)};
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

let Clipboard = function(c) {
    this.start = null;
    this.end = null;

    this.canvas = document.createElement("canvas");
    this.canvas.width = c.offsetWidth;
    this.canvas.height = c.offsetHeight;
    this.context = this.canvas.getContext("2d");

    this.moveTo = function(position) {
        let width = position.x - this.start.x;
        let height = position.y - this.start.y;

        // Move position to the new location without reducing the width.
        this.start.x = position.x;
        this.start.y = position.y;
        this.end.x += width;
        this.end.y += height;
    };

    this.moveBy = function(x, y) {
        this.start.x += x;
        this.start.y += y;
        this.end.x += x;
        this.end.y += y;
    }
};

let Selection = function(c) {
    this.start = null;
    this.end = null;
    this.margin = 5;

    this.canvas = document.createElement("canvas");
    this.canvas.width = c.offsetWidth;
    this.canvas.height = c.offsetHeight;
    this.context = this.canvas.getContext("2d");
};

let PixelPath = function(context) {
    this.prev = null;

    this.colour = "#" + lineColour.value;
    this.radius = parseInt(lineRadiusSlider.value);
    this.originalRadius = this.radius;
    this.done = false;

    this.push = function(e) {
        if (this.radius === 0) return;

        // Add all pixels from current point to previous point in a straight line
        if (this.prev !== null) {
            let coefficient = (this.prev.x - e.x) / (this.prev.y - e.y);

            let angle = Math.atan(coefficient);

            let dx0 = Math.cos(-angle) * this.radius;
            let dy0 = Math.sin(-angle) * this.radius;

            context.beginPath();
            context.moveTo(e.x - dx0, e.y - dy0);
            context.lineTo(this.prev.x - dx0, this.prev.y - dy0);
            context.lineTo(this.prev.x + dx0, this.prev.y + dy0);
            context.lineTo(e.x + dx0, e.y + dy0);

            context.fillStyle = this.colour;
            context.fill();
            context.lineWidth = 0;
            context.strokeStyle = this.colour;
            context.stroke();
        }

        context.beginPath();
        context.arc(e.x, e.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.colour;
        context.fill();

        context.lineWidth = 0;
        context.strokeStyle = this.colour;
        context.stroke();

        this.prev = {x: e.x, y: e.y};
    };
};

function Map(c, room_id) {
    let context = c.getContext("2d");

    this.canvas = document.createElement("canvas");
    this.canvas.width = c.offsetWidth * 3;
    this.canvas.height = c.offsetHeight * 3;
    this.context = this.canvas.getContext("2d");

    let socket = socketIOClient();

    let zoom = 1;
    let isMousedown = false;
    let viewboxOffset = {x: -c.offsetWidth, y: -c.offsetHeight};
    let mouseDownPosition = {x: 0, y: 0};
    let previousMousePosition = {x: 0, y: 0};

    // Variables to track if a mousedown + mouseup event is registered as a click.
    let moveThreshold = 5; // px
    let isMoving = false;

    let boundingBox = {min: {x: 0, y: 0}, max: {x: 1, y: 1}};

    /*
     * Public variables to change the BattleMap display.
     */
    this.gridStyle = "squared";
    this.gridSize = 100;
    this.action = "drawing";

    let select = {
        start: null,
        end: null
    };

    /*
     * Variables to store history/future stacks.
     */
    let drawing = [];
    // Temporally ordered list of old board states
    let drawingHistory = [];
    let drawingFuture = [];


    function getMousePos(evt) {
        let rect = c.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    this.shareMap = function() {
        let data = this.canvas.toDataURL("image/png");
        socket.emit("update", {
            image: data,
            campaign: CAMPAIGN_NAME
        });
    };

    this.initialize = function() {
        socket.on("join", (data) => {
            console.log("New user detected: " + data);
        });
        socket.on("update", (data) => {
            let ctx = this.context;
            let cvs = this.canvas;
            let img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, cvs.width, cvs.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = data.image;
        });

        socket.emit("join", {
            "campaign": CAMPAIGN_NAME
        });

        setInterval(() => this.shareMap(), 1000);

        this.snapshot();
    };

    this.destroy = function() {
        socket.emit("leave", room_id);
    };

    /*
    * Returns the currently active path, if the last path is not active anymore, it will create a new one.
    */
    this.getPath = function() {
        if (drawing.length === 0 || drawing[drawing.length - 1].done) {
            drawing.push(new PixelPath(this.context));
            // Clear history if a new path gets added.
            drawingFuture = [];
        }

        return drawing[drawing.length - 1];
    };

    this.drawAction = function(ev) {
        let point = getMousePos(ev);
        if (point.x < 0 || point.y < 0 || point.x > c.offsetWidth || point.y > c.offsetHeight) return;

        point = pMul(pSub(point, viewboxOffset), 1/zoom);
        let path = this.getPath();

        path.radius = path.originalRadius;
        path.push(point);

        boundingBox.min = pMin(point, boundingBox.min);
        boundingBox.max = pMax(point, boundingBox.max);
    };

    this.undo = function() {
        console.log("Undoing wiht length", drawingHistory.length);
        if (drawingHistory.length === 0) return;

        // Remember current board state to go back to later.
        this.futureSnapshot();
        if (drawingHistory.length === 1) {
            // Never remove the initial snapshot (empty canvas)
            let snapshot = drawingHistory[0];
            this.context.putImageData(snapshot, 0, 0);
        } else {
            let snapshot = drawingHistory.pop();
            this.context.putImageData(snapshot, 0, 0);
        }
    };

    this.redo = function() {
        if (drawingFuture.length === 0) return;

        this.snapshot();
        let snapshot = drawingFuture.pop();
        this.context.putImageData(snapshot, 0, 0);
    };

    this.snapshot = function() {
        let image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        drawingHistory.push(image);
    };

    this.futureSnapshot = function() {
        let image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        drawingFuture.push(image);
    };

    this.finalize = function() {
        drawing.push(new PixelPath(this.context));
    };

    this.cut = function() {
        if (select.end === null) {
            console.log("Cannot cut when not having selected anything.");
        }

        this.snapshot();

        this.copy();

        let w = select.end.x - select.start.x;
        let h = select.end.y - select.start.y;
        this.context.clearRect(select.start.x, select.start.y, w, h);
    };

    this.copy = function() {
        copyStartEndPosition(select, clipboard);

        let w = select.end.x - select.start.x;
        let h = select.end.y - select.start.y;
        clipboard.context.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
        clipboard.context.drawImage(canvas, select.start.x, select.start.y, w, h, select.start.x, select.start.y, w, h);
    };

    this.paste = function() {
        drawingFuture = [];
        this.snapshot();

        let w = clipboard.end.x - clipboard.start.x;
        let h = clipboard.end.y - clipboard.start.y;
        selection.context.drawImage(clipboard.canvas, clipboard.start.x, clipboard.start.y, w, h, select.start.x, select.start.y, w, h);
        clipboard.moveTo(select.start);

        copyStartEndPosition(clipboard, select);
        copyStartEndPosition(clipboard, selection);

        // Set action to resizing to move the stuff.
        setAction("resizing");
    };


    this.render = function() {
        // Take into account window resizes.
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;

        context.clearRect(0, 0, c.width, c.height);

        // Draw the grid.
        if (this.gridStyle === "squared") {
            context.strokeStyle = "black";
            context.lineWidth = "1";

            let increment = this.gridSize * zoom;

            let xMin = 0 + viewboxOffset.x;
            let yMin = 0 + viewboxOffset.y;
            let xMax = this.canvas.width * zoom + viewboxOffset.x;
            let yMax = this.canvas.height * zoom + viewboxOffset.y;
            for (let x = xMin; x < xMax; x += increment) {
                context.beginPath();
                context.moveTo(x, yMin);
                context.lineTo(x, yMax);
                context.stroke();
            }
            for (let y = yMin; y < yMax; y += increment) {

                context.beginPath();
                context.moveTo(xMin, y);
                context.lineTo(xMax, y);
                context.stroke();
            }
        }

        context.drawImage(this.canvas,
            -viewboxOffset.x / zoom,
            -viewboxOffset.y / zoom,
            c.offsetWidth / zoom,
            c.offsetHeight / zoom,
            0,
            0,
            c.offsetWidth,
            c.offsetHeight
        );


        // context.drawImage(battleMap.image, viewboxOffset.x, viewboxOffset.y,
        //     c.width * zoom, c.height * zoom, 0, 0, c.width, c.height);
    };


    this.onMouseScroll = function(event) {

        let diff = (-event.deltaY * 0.02) * zoom;
        zoom = zoom + diff;

        let pos = getMousePos(event);
        viewboxOffset.x -= pos.x * diff;
        viewboxOffset.y -= pos.y * diff;
        event.preventDefault();
    };
    this.onMouseDown = function(event) {
        isMousedown = true;

        if ((event.buttons & 1) === 1) { // Left mouse button does actions, right mouse doesnt.
            if (this.action === "drawing") {
                select.end = null;

                this.snapshot();

                drawingFuture = [];
                this.drawAction(event);
            } else if (this.action === "selecting") {
                this.startSelect(event);
            }
        }
        mouseDownPosition = {x: event.x, y: event.y};
        previousMousePosition = {x: event.x, y: event.y};
    };
    this.onMouseUp = function(event) {
        isMousedown = isMoving = false;

        if (this.action === "drawing") {
            this.finalize();
        } else if (this.action === "selecting") {
            this.endSelect(event);
        }

        // Dont register clicks after moving more than N pixels.
        if (distance(mouseDownPosition, event) > moveThreshold)
            return;

        // Mouseup event registered as click.
    };
    this.onMouseMove = function(event) {
        if (isMoving ||
            (distance(mouseDownPosition, event) > moveThreshold && isMousedown)
        ) {
            isMoving = true;
            if ((event.buttons & 2) === 2) { // Right mouse button only offsets viewbox
                viewboxOffset = pSub(viewboxOffset, pMul(pSub(previousMousePosition, event), zoom));
            } else {
                if (this.action === "drawing") {
                    this.drawAction(event);
                } else if (this.action === "selecting") {
                    this.endSelect(event);
                } else if (this.action === "resizing") {
                    this.resizeAction(event);
                }
            }

        }

        previousMousePosition = {x: event.x, y: event.y};
    };
    this.onKeyDown = function(event) {
        // Onkeydown eventhandler
        if (event.ctrlKey && event.key === "z") {
            this.undo();
        } else if (event.ctrlKey && event.key === "y") {
            this.redo();
        } else if (event.ctrlKey && event.key === "x") {
            this.cut();
        } else if (event.ctrlKey && event.key === "v") {
            this.paste();
        } else if (event.ctrlKey && event.key === "c") {
            this.copy();
        }
    };
}

let map;
let selection;
let clipboard;
export default function BattleMap(props) {
    React.useEffect(() => {
        const canvas = document.getElementById("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // TODO: Extract room id from selected campaign.
        map = new Map(canvas, 1111);
        selection = new Selection(canvas);
        clipboard = new Clipboard(canvas);
        map.initialize();

        canvas.addEventListener("mousedown", (e) => map.onMouseDown(e));
        document.addEventListener("mouseup", (e) => map.onMouseUp(e));
        document.addEventListener("mousemove", (e) => map.onMouseMove(e));
        document.addEventListener("keydown", (e) => map.onKeyDown(e));
        canvas.addEventListener("wheel", (e) => map.onMouseScroll(e));
        // Prevent right mouse button menu popup
        canvas.oncontextmenu = () => {
            return false
        };

        // 60 fps rendering for canvas.
        let interval = setInterval(() => map.render(), 1000 / 60);
        return () => {
            clearInterval(interval);
            canvas.removeEventListener("mousedown", (e) => map.onMouseDown(e));
            document.removeEventListener("mouseup", (e) => map.onMouseUp(e));
            document.removeEventListener("mousemove", (e) => map.onMouseMove(e));
            document.removeEventListener("keydown", (e) => map.onKeyDown(e));
            canvas.removeEventListener("wheel", (e) => map.onMouseScroll(e));

            map.destroy();
        }
    }, []);

    return <>
        <div className={"left-content-bar"}>
            asd
        </div>
        <div className={"main-content"}>
            <canvas id={"canvas"} style={{backgroundColor: "white"}}/>
        </div>
    </>
}
