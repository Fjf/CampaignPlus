import React, {useRef} from "react";
import {characterService} from "../../services/characterService";
import {TextField} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {MdClose} from "react-icons/all";
import {toggleRightContentBar} from "../../services/constants";

function ItemsList(props) {
    const [query, setQuery] = React.useState("");
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [items, setItems] = React.useState([]);
    const bar = useRef(null);

    React.useEffect(() => {
        toggleRightContentBar(bar);
        characterService.getItems().then(r => {
            setItems(r);
        });
    }, []);

    React.useEffect(() => {
        setFilteredItems(items.filter((val) => val.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, items]);

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
        <div>
            <h3>Items</h3>
            <IconButton size={"small"} onClick={() => {toggleRightContentBar(bar, props.onClose)}}
                        style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
        </div>
        <TextField
            label={"Search"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        <div className={"items-list"}>
            {filteredItems.map((item, i) => {
                return <div key={i} onClick={() => {
                    characterService.addItem(props.character.id, item.id).then(r => {
                        props.onSelect(r);
                    })
                }}>
                    <div>{item.name}</div><div>{item.value}</div>
                </div>
            })}
        </div>
    </div>

}

export default React.memo(ItemsList);