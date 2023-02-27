function store_map(obj, button) {
    if (!(obj instanceof CanvasFrame))
        throw "Cannot store data not of type CanvasFrame."

    let func = function(data) {
        if (!data.success) {
            console.log("Error: " + data.error);
            button.style.borderColor = "red";
        }

        if (button != undefined) {
            button.style.borderColor = "green";
        }
    }

    let data = {
        campaign_id: CAMPAIGN_ID,
        battlemap: JSON.stringify(obj),
        name: prompt("Name the map;")
    }

    requestApiJsonData("/api/uploadbattlemap", "POST", data, func)
}


function get_battlemaps() {
    let func = function(data) {
        if (!data.success) {
            console.log("Error: " + data.error);
        }

        console.log(data)
    }

    let data = {
        campaign_id: CAMPAIGN_ID
    }

    requestApiJsonData("/api/getbattlemaps", "POST", data, func)
}


function getNSquares(sizewidth, sizeheight, squares){
    margin =  1.8 * 2

    a4 = {
        x: Math.floor((21.0 - margin) / squares),
        y: Math.floor((29.7 - margin) / squares)
    }

    return a4
}

function makeBattleMap() {
    a4 = {x: 2, y: 2};
    let dim = getNSquares(a4.x, a4.y, 2);

    xSteps = dim.x;
    ySteps = dim.y;

    for (let i = 0; i < a4.x; i++) {
        for (let j = 0; j < a4.y; j++) {
//            page = new CanvasFrame()
        }
    }
    xStepSize = battlemap.width / xSteps;
    yStepSize = battlemap.height / ySteps;
    for (let x = 0; x < xSteps; x++) {
        for (let y = 0; y < ySteps; y++) {
            let battleSquare = new CanvasFrame(x*xStepSize, y*yStepSize, xStepSize, yStepSize);

            // Add a line below the square.
            battleSquare.addLine(0, yStepSize - 1, xStepSize, yStepSize - 1);
            // Add a line to the right of the square.
            battleSquare.addLine(xStepSize - 1, 0, xStepSize - 1, yStepSize);

            battleSquare.mouseHandler = function(e) {
                if (selectedImage == null)
                    return;

                if (this.image == null) {
                    this.image = new Image();
                    this.image.src = selectedImage.src;
                    this.image.width = this.width * selectedImage._widthMultiplier;
                    this.image.height = this.height * selectedImage._heightMultiplier;
                } else {
                    this.image = null;
                }
                canvas.draw();
                return true;
            }

            battlemap.addChild(battleSquare);
        }
    }

    battlemap.scrollHandler = function(e) {
        console.log("Zoommm");
        return true;
    }
}



class CanvasFrame {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = null;

        this.children = [];
        this.lines = [];
        this.text = [];
    }

    addText(text, x, y) {
        this.text.push({text: text, x: x + this.x, y: y + this.y});
    }

    addLine(x, y, endX, endY) {
        this.lines.push({x: x + this.x, y: y+this.y, endX: endX+this.x, endY: endY+this.y});
    }

    isInBounds(x, y) {
        if (y == null)
            throw "Pass two numbers.";
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    /*
     *  CanvasFrame objects eat mouse events when clicked on them.
     *  Set a function mouseHandler which returns false to create an unclickable object.
     */
    mouseHandler(e) {
        console.log("Unhandled mouse event.");
        console.log(this);
        return true;
    };

    scrollHandler(e) {
        return false;
    }

    addChild(o) {
        if (!o instanceof CanvasFrame) {
            throw "Illegal child type. Not typeof CanvasFrame.";
        }

        o.x += this.x;
        o.y += this.y;
        this.children.push(o);
    }

    /*
     *  Mouse events have to be delivered to the correct object.
     *  For this all children's bounds will be checked with the mouse event.
     *
     *  Returns false if the event was handled, true if not.
     */
    childrenMouseHandler(e) {
        for (const child of this.children) {
            if(child.isInBounds(e.x, e.y)) {
                if(!child.childrenMouseHandler(e)) {
                    return false;
                }
            }
        }

        if (this.mouseHandler(e))
            return false;
        return true;
    }

     /*
      *  Mouse scroll events have to be delivered to the correct object.
      *  For this all children's bounds will be checked with the mouse event.
      *
      *  Returns false if the event was handled, true if not.
      */
    childrenScrollHandler(e) {
        for (const child of this.children) {
            if(child.isInBounds(e.x, e.y)) {
                if(!child.childrenScrollHandler(e)) {
                    return false;
                }
            }
        }

        if (this.scrollHandler(e))
            return false;
        return true;
    }

    _draw(ctx) {
        if (this.color != null) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.image != null) {
            ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        for (const line of this.lines) {
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.endX, line.endY);
            ctx.stroke();
        }

        ctx.font = "25px Verdana";
        ctx.fillStyle = "black";

        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        for (const o of this.text) {
            ctx.strokeText(o.text, o.x, o.y);
            ctx.fillText(o.text, o.x, o.y);

            ctx.stroke();
            ctx.fill();
        }

        for (const child of this.children) {
            child._draw(ctx);
        }
    }

    print() {
        let ctx = canvas.canvas.getContext("2d");
        let img = ctx.getImageData(this.x, this.y, this.width, this.height);

        let temp_canvas = document.createElement('canvas');
        let temp_ctx = temp_canvas.getContext('2d');
        temp_canvas.width = img.width;
        temp_canvas.height = img.height;
        temp_ctx.putImageData(img, 0, 0);

        var link = document.getElementById("link");
        link.setAttribute('download', 'BattleMap.png');
        link.setAttribute('href', temp_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    }
}

class Menu extends CanvasFrame {
    constructor(x, y, width, height) {
        super(x, y, width, height)
    }
}

class Canvas extends CanvasFrame {
    constructor(width, height) {
        super(0, 0, width, height);

        this.canvas = document.getElementById("battlemap");
        this.canvas.height = height;
        this.canvas.width = width;
        this.canvas.style.width = "80%";

        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("click", (e) => {
            const obj = this.relativeMouse(e);

            this.childrenMouseHandler(obj);
        });

        this.canvas.addEventListener("wheel", (e) => {
            const obj = this.relativeMouse(e);

            if (!this.isInBounds(obj.x, obj.y))
                return;

            if (!this.childrenScrollHandler(obj))
                e.preventDefault();
        }, false);

        this.lines = [];
    }

    relativeMouse(e) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height,
            scroll: e.deltaY
        }
    }

    mouseHandler(e) {
        console.log(e.x, e.y);
    }

    draw() {
        // Clear the canvas.
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw the canvas and all children.
        this._draw(this.ctx);
    }
}

let canvas = new Canvas(1654 / 0.8, 2339);
let battlemap = new CanvasFrame(
    0,
    0,
    .8 * canvas.width,
    canvas.height
)
let menu = new CanvasFrame(
    .8 * canvas.width,
    .0 * canvas.height,
    .2 * canvas.width,
    1  * canvas.height
)

menu.color = "#000000";
menu.scrollHandler = function(e) {
    minChild = "Infinity";
    maxChild = 0;

    for (const child of menu.children) {
        if (child.y < minChild) {
            minChild = child.y;
        }
        if (child.y + child.height > maxChild) {
            maxChild = child.y + child.height;
        }
    }

    // If there are no more children out of bounds, prevent scrolling.
    if (minChild >= 0 && e.scroll < 0
     || maxChild <= this.height && e.scroll > 0) {
        return;
    }

    for (const child of menu.children) {
        child.y -= e.scroll * 5;
        canvas.draw();
    }
}

let button;

let images = [
    ["/static/images/battlemap/bush.png", 1, 1],
    ["/static/images/battlemap/rock.png", 1, 1],
    ["/static/images/battlemap/rock.png", 2, 2],
    ["/static/images/battlemap/tree.png", 2, 2]
]

let selectedImage = null;

for (let i = 0; i < images.length; i += 2) {
    let padding = 10;
    let height = menu.width / 2;
    let buttons = [];


    buttons.push(new CanvasFrame(padding, padding + i/2 * (height + padding), menu.width / 2 - 2*padding, height));
    if (i + 1 < images.length)
        buttons.push(new CanvasFrame(menu.width / 2 + padding, padding + i/2 * (height + padding), menu.width / 2 - 2*padding, height));

    let count = 0;
    for (button of buttons) {
        menu.addChild(button);

        let str = "You clicked button " + (i + count);

        button.image = new Image();
        button.image.src = images[i + count][0];
        button.image.width = button.width;
        button.image.height = button.height;

        button.image._widthMultiplier = images[i + count][1];
        button.image._heightMultiplier = images[i + count][2];

        button.addText(images[i + count][1] + " " + images[i + count][2], 2, button.height - 5);
        button.image.onload = function() {
            canvas.draw();
        }
        button.color = "#FFFFFF";
        button.mouseHandler = function() {
            selectedImage = this.image;
            return true;
        }
        count += 1;
    }
}
canvas.addChild(menu);
canvas.addChild(battlemap);
makeBattleMap();

canvas.draw();

get_battlemaps();