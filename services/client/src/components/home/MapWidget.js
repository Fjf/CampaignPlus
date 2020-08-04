import React from "react";
import {FileDrop} from 'react-file-drop';
import {dataService} from "../services/dataService";
import {IconButton, TextField, TextareaAutosize} from "@material-ui/core"
import {BsTrash, BsUpload, FaArrowLeft, FaPlusCircle} from "react-icons/all"
import {campaignService} from "../services/campaignService";

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

function Map(c) {
    let context = c.getContext("2d");

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

    function createMarkerPosition(child) {
        return {
            x: (child.x * zoom) + viewboxOffset.x,
            y: (child.y * zoom) + viewboxOffset.y
        }
    }


    function isCoordinateOnMarker(child, pos) {
        let markerPosition = getMarkerPosition(child);
        return pos.x > markerPosition.x && pos.x < markerPosition.x + markerWidth
            && pos.y > markerPosition.y && pos.y < markerPosition.y + markerHeight
    }

    let onMapChange = null;
    this.onSetVisibleMap = (m) => {
        setVisibleMap(m)
    };

    function setVisibleMap(newMap) {
        // Make sure the child always knows how to get back to the parent.
        newMap.parent = visibleMap;
        newMap.hover = false;
        newMap.bhover = false;

        overwriteVisibleMap(newMap);
    }

    this.forceUpdate = function(newMap) {
        visibleMap = newMap;

        let parent = visibleMap.parent;
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i].id === visibleMap.id) {
                parent.children[i] = visibleMap;
            }
        }
    };

    function overwriteVisibleMap(newMap) {
        let img = new Image();
        img.onload = () => {
            zoom = Math.max(img.width / c.width, img.height / c.height);
            newMap.zoom = zoom;
        };
        img.src = newMap.map_url;
        newMap.image = img;

        visibleMap = newMap;

        if (onMapChange !== null) {
            onMapChange(visibleMap);
        }
    }

    this.setOverwriteVisibleMap = function(newMap) {
        overwriteVisibleMap(newMap)
    };

    this.setOnMapChange = function(f) {
        onMapChange = f;
    };

    let maps = null;
    let visibleMap = null;
    this.setMap = function(new_map) {
        console.log(new_map);
        maps = new_map;
        setVisibleMap(new_map);
    };

    let hoverMarker = null;
    this.setHoverMarker = (h) => {
        hoverMarker = h
    };

    this.render = function() {
        if (visibleMap === null) return;

        // Take into account window resizes.
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;

        // Clamp image to canvas boundary.
        let ww = visibleMap.image.width - c.width * zoom;
        let hh = visibleMap.image.height - c.height * zoom;
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

        context.clearRect(0, 0, c.width, c.height);
        context.drawImage(visibleMap.image, viewboxOffset.x, viewboxOffset.y,
            c.width * zoom, c.height * zoom, 0, 0, c.width, c.height);

        for (let i = 0; i < visibleMap.children.length; i++) {
            let child = visibleMap.children[i];
            let hover = child.hover || child.bhover;
            let w = hover ? 5 : 0;
            let h = hover ? 5 : 0;

            let markerPosition = getMarkerPosition(child);
            context.drawImage(icons.get("position-marker"),
                markerPosition.x - w / 2,
                markerPosition.y - h,
                markerWidth + w, markerHeight + h);

            if (hover) {
                const fontHeight = 18;
                context.font = `900 ${fontHeight}px Arial`;
                context.fillStyle = "white";
                let size = context.measureText(child.name);
                context.fillText(child.name, markerPosition.x + (markerWidth + w) / 2 - size.width / 2, markerPosition.y - fontHeight);

                context.lineWidth = "0.5px";
                context.strokeStyle = "black";
                context.strokeText(child.name, markerPosition.x + (markerWidth + h) / 2 - size.width / 2, markerPosition.y - fontHeight);
                context.stroke();
            }
        }

        if (hoverMarker !== null) {
            context.drawImage(icons.get("position-marker"),
                hoverMarker.x - markerWidth / 2,
                hoverMarker.y - markerHeight,
                markerWidth, markerHeight);
        }
    };

    this.onMouseScroll = function(event) {
        if (visibleMap === null) return;

        let diff = (event.deltaY * 0.02) * zoom;
        let nextZoom = zoom + diff;

        if (nextZoom < 0.1 && nextZoom < zoom) return;
        if (nextZoom * c.width > visibleMap.image.width * 1.2 &&
            nextZoom * c.height > visibleMap.image.height * 1.2 && nextZoom > zoom) return;

        zoom = nextZoom;
        visibleMap.zoom = zoom;

        let pos = getMousePos(event);
        viewboxOffset.x -= pos.x * diff;
        viewboxOffset.y -= pos.y * diff;
        event.preventDefault();
    };

    this.onMouseDown = function(event) {
        if (visibleMap === null) return;
        if (event.button === 2 && hoverMarker !== null) {
            hoverMarker = null;
        }

        isMousedown = true;

        mouseDownPosition = {x: event.x, y: event.y};
        previousMousePosition = {x: event.x, y: event.y};
    };

    this.onMouseUp = function(event) {
        if (visibleMap === null) return;
        isMousedown = isMoving = false;

        // Dont register clicks after moving more than N pixels.
        if (distance(mouseDownPosition, event) > moveThreshold)
            return;

        let pos = getMousePos(event);

        if (hoverMarker !== null) {
            let loc = createMarkerPosition(pos);
            dataService.createMap(visibleMap.campaign_id, visibleMap.id, loc.x, loc.y).then(child => {
                visibleMap.children.push(child);
                setVisibleMap(child);
            });

            hoverMarker = null;
            return;
        }

        for (let i = 0; i < visibleMap.children.length; i++) {
            let child = visibleMap.children[i];
            if (isCoordinateOnMarker(child, pos)) {
                setVisibleMap(child);
            }
        }
    };


    this.onMouseMove = function(event) {
        if (visibleMap === null) return;
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
                child.hover = true;
                document.body.style.cursor = "pointer";
                break;
            }
            child.hover = false;
        }

        previousMousePosition = {x: event.x, y: event.y};
        if (hoverMarker !== null) {
            hoverMarker = pos;
        }
    };

    this.hasParent = function() {
        return visibleMap !== null && visibleMap.parent_map_id !== null;
    };

    this.toParent = function() {
        if (this.hasParent()) {
            visibleMap = visibleMap.parent;
            zoom = visibleMap.zoom;
        }

        // Callback for any eventhandlers.
        if (onMapChange !== null) {
            onMapChange(visibleMap);
        }
    };
    this.setHover = function(actualChild, b) {
        for (let i = 0; i < visibleMap.children.length; i++) {
            if (visibleMap.children[i].id === actualChild.id) {
                visibleMap.children[i].bhover = b;
            }
        }
    };

    this.onKeyDown = function(event) {
        if (event.key === "Escape" && hoverMarker !== null) hoverMarker = null;
    };

}

let map;
const icons = new Icons();
icons.load();

export default function MapWidget(props) {
    const [campaign, setCampaign] = React.useState(null);
    const [selectedMap, setSelectedMap] = React.useState({
        name: "",
        story: "",
        map_url: "",
        children: []
    });

    React.useEffect(() => {
        const canvas = document.getElementById("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        map = new Map(canvas);
        map.setOnMapChange((m) => {
            setSelectedMap(m);
        });

        canvas.addEventListener("mousedown", map.onMouseDown);
        document.addEventListener("mouseup", map.onMouseUp);
        document.addEventListener("mousemove", map.onMouseMove);
        document.addEventListener("keydown", map.onKeyDown);
        canvas.addEventListener("wheel", map.onMouseScroll);
        // Prevent right mouse button menu popup
        canvas.oncontextmenu = () => {
            return false
        };

        let interval = setInterval(map.render, 1000 / 60);
        return () => {
            clearInterval(interval)
        }
    }, []);

    React.useEffect(() => {
        if (campaign === null) return;
        dataService.getMaps(campaign.id).then(r => {
            map.setMap(r);
        });
    }, [campaign]);

    function uploadFile(files, event) {
        let file = files[0];
        if (!(file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg"))) {
            alert("Only png or jpg files are supported.");
            return
        }

        const reader = new FileReader();
        reader.addEventListener("load", function() {
            selectedMap.image.src = reader.result;
            map.forceUpdate(selectedMap);
        }, false);

        dataService.setMapImage(selectedMap, file).then(r => {
            console.log("Uploaded image successfully.")
        });

        reader.readAsDataURL(file);
    }

    function alterMap() {
        dataService.alterMap(selectedMap.id, {
            name: selectedMap.name,
            story: selectedMap.story
        }).then(r => { /* Upload successful. */
        });
        map.forceUpdate(selectedMap);
    }

    return <>
        <div className={"left-content-bar"}>
            <h3>Campaigns</h3>
            {
                props.campaigns.map((lCampaign, i) => {
                    return <div key={i}
                                className={"campaign-list-entry"}
                                onClick={() => setCampaign(props.campaigns[i])}>
                        <div>{lCampaign.name}</div>
                        <div>{lCampaign.is_owner ? "You" : lCampaign.owner}</div>
                    </div>
                })
            }
        </div>
        <div className={"main-content"}>
            <canvas id={"canvas"} style={{backgroundColor: "white"}}/>
            {selectedMap !== null ?
                <div className={"icon-bar"} style={{top: "8px", left: "8px", position: "absolute"}}>
                    <IconButton variant={"outlined"} color={"secondary"} aria-label="back" onClick={() => {
                        map.toParent();
                    }}>
                        <FaArrowLeft/>
                    </IconButton>
                    <IconButton variant={"outlined"} color={"secondary"} aria-label="add" onClick={() => {
                        map.setHoverMarker({x: 0, y: 0});
                    }}>
                        <FaPlusCircle/>
                    </IconButton>
                </div> : null}
        </div>
        <div className={"right-content-bar"}>
            <div className={"standard-bar-entry"}>
                <h3>Map Info</h3>
                <div className={"icon-bar"}>
                    <IconButton
                        size={"small"}
                        onClick={alterMap}>
                        <BsUpload/>
                    </IconButton>
                    <IconButton
                        size={"small"}
                        onClick={() => {
                            dataService.deleteMap(selectedMap.campaign_id, selectedMap.id).then(r => {
                                map.setMap(r);
                            });
                        }}>
                        <BsTrash/>
                    </IconButton>
                </div>
            </div>
            <TextField
                label={"Title"}
                value={selectedMap.name}
                onChange={(e) => setSelectedMap({
                    ...selectedMap,
                    name: e.target.value
                })}/>
            <b>Additional Information</b>
            <TextareaAutosize
                rowsMin={5}
                label={"Additional Information"}
                value={selectedMap.story}
                onChange={(e) => setSelectedMap({
                    ...selectedMap,
                    story: e.target.value
                })}
            />
            <b>Children</b>
            {
                selectedMap.children.map((child, i) => {
                    return <div
                        className={"campaign-list-entry"}
                        key={i}
                        onClick={() => map.onSetVisibleMap(child)}
                        onMouseOver={(e) => map.setHover(child, true)}
                        onMouseOut={(e) => map.setHover(child, false)}
                    >
                        {child.name}
                    </div>
                })
            }
            <div>
                <FileDrop
                    onDrop={uploadFile}
                >
                    Drop an image here to overwrite the current map.
                </FileDrop>
            </div>
        </div>
    </>
}