import {characterService} from "../../services/characterService";
import React from "react";
import ItemInfo from "./ItemInfo";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle, MdClose} from "react-icons/all";
import ItemsList from "./ItemsList";
import SpellsList from "./SpellsList";
import {TextField} from "@material-ui/core";

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

    function overweight() {
        return (totalWeight() > character.info.strength * 15);
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
            <div style={overweight() ? {color: "red"} : null}>Total Weight: ({totalWeight()} lb.)</div>

            <div className={"basic-list-entry"}>
                <div className={"currency-entry"}>
                    <div>CP</div>
                    <div><TextField
                        value={character.copper}
                        onChange={(e) => {
                            props.setCharacter({
                                ...character,
                                copper: e.target.value
                            })
                        }}
                    /></div>
                </div>
                <div className={"currency-entry"}>
                    <div>SP</div>
                    <div><TextField
                        value={character.silver}
                        onChange={(e) => {
                            props.setCharacter({
                                ...character,
                                silver: e.target.value
                            })
                        }}
                    /></div>
                </div>
                <div className={"currency-entry"}>
                    <div>EP</div>
                    <div><TextField
                        value={character.electron}
                        onChange={(e) => {
                            props.setCharacter({
                                ...character,
                                electron: e.target.value
                            })
                        }}
                    /></div>
                </div>
                <div className={"currency-entry"}>
                    <div>GP</div>
                    <div><TextField
                        value={character.gold}
                        onChange={(e) => {
                            props.setCharacter({
                                ...character,
                                gold: e.target.value
                            })
                        }}
                    /></div>
                </div>
                <div className={"currency-entry"}>
                    <div>PP</div>
                    <div><TextField
                        value={character.platinum}
                        onChange={(e) => {
                            props.setCharacter({
                                ...character,
                                platinum: e.target.value
                            })
                        }}
                    /></div>
                </div>
            </div>
            <div className={"items-list"}>
                {inventory.map((item, i) => {
                    return <div
                        key={i}
                        onClick={() => {
                            console.log("Selected item.");
                            setItem(item);
                        }}>
                        {item.amount} {item.info.name}
                    </div>
                })}
            </div>
        </div>
        {item === null ? null : <ItemInfo
            item={item}
            onClose={() => setItem(null)}
            onSave={(item) => {
                characterService.saveItem(character.id, item).then(r => {
                    let idx = inventory.findIndex(x => x.info.id === r.info.id);
                    if (idx === -1) idx = inventory.length;

                    if (r.amount === 0) {
                        setInventory([...inventory.slice(0, idx), ...inventory.slice(idx + 1)]);
                    } else {
                        setInventory([...inventory.slice(0, idx), r, ...inventory.slice(idx + 1)]);
                    }
                });
                setItem(null);
            }}
        />}
        {!addingItem ? null : <ItemsList
            character={character}
            onClose={() => {
                setAddingItem(false)
            }}
            onSelect={(item) => {
                setInventory([...inventory, item]);
                characterService.addItem(props.character.id, item.id).then(r => {
                    console.log("Saved item successfully.");
                });
            }}
        />}
    </>
}