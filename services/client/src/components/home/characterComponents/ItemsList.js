import React, {useRef} from "react";
import {characterService} from "../../services/characterService";
import {TextField, Tooltip} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {MdClose} from "react-icons/all";
import {toggleRightContentBar} from "../../services/constants";

let itemStorage = null;
ItemsList.defaultProps = {
    closeOnSelect: false
};

function ItemsList(props) {
    const [query, setQuery] = React.useState("");
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [items, setItems] = React.useState([]);
    const bar = useRef(null);

    React.useEffect(() => {
        toggleRightContentBar(bar);

        if (itemStorage !== null) {
            setItems(itemStorage);
        } else {
            characterService.getItems().then(r => {
                setItems(r);
                itemStorage = r;
            });
        }
    }, []);

    React.useEffect(() => {
        let fItems = items;
        if (typeof (props.filter) === "function") {
            fItems = fItems.filter(props.filter);
        }
        setFilteredItems(fItems.filter((val) => {
            let basic_match = val.name.toLowerCase().includes(query.toLowerCase()) ||
                              val.description.toLowerCase().includes(query.toLowerCase());

            if (val.gear_category !== undefined) {
                return basic_match || val.gear_category.toLowerCase().includes(query.toLowerCase());
            }
        }));
    }, [query, items]);

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
        <div>
            <h3>Items</h3>
            <IconButton size={"small"} onClick={() => {
                toggleRightContentBar(bar, props.onClose)
            }}
                        style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
        </div>
        <TextField
            label={"Search"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        <div className={"items-list"}>
            {filteredItems.map((item, i) => {
                return <Tooltip title={item.description}><div key={i} onClick={() => {
                    props.onSelect(item);
                    if (props.closeOnSelect) toggleRightContentBar(bar, props.onClose);
                }}>
                    <div>{item.name}</div>
                    <div>{item.cost}</div>
                </div></Tooltip>
            })}
        </div>
    </div>
}

export default React.memo(ItemsList);