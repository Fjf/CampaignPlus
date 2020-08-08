import {characterService} from "../../services/characterService";
import React from "react";
import ItemInfo from "./ItemInfo";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle, MdClose} from "react-icons/all";
import ItemsList from "./ItemsList";

export default function CharacterInventory(props) {
    const character = props.character;

    const [inventory, setInventory] = React.useState([]);
    const [item, setItem] = React.useState(null);
    const [addingItem, setAddingItem] = React.useState(false);

    React.useEffect(() => {
        characterService.getCharacterInventory(character.id).then(r => {
            setInventory(r);
        }, e => {
            console.error(e);
        });
    }, [character]);

    function totalWeight() {
        return inventory.reduce((acc, item) => acc + item.info.weight * item.amount, 0);
    }

    return <>
        <div className={"inventory-wrapper"}>
            <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute"}}>
                <IconButton size={"small"} onClick={() => {
                    setAddingItem(true);
                }}>
                    <FaPlusCircle/>
                </IconButton>
            </div>
            <h3>Inventory</h3>
            <div>Total Weight: ({totalWeight()} lb.)</div>
            <div className={"spells-list"}>
                {inventory.map((item, i) => {
                    return <div key={i} className={"basic-list-entry"}
                                onClick={() => {
                                    setItem(item);
                                }}>
                        {item.info.name}
                    </div>
                })}
            </div>
        </div>
        {item === null ? null : <ItemInfo item={item.info} onClose={() => setItem(null)}/>}
        {!addingItem ? null : <ItemsList
            onClose={() => {
                setAddingItem(false)
            }}
            onSelect={(item) => {
                setInventory({...inventory, item});
            }}
        />}
    </>
}