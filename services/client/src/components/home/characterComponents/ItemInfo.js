import React, {useRef} from "react";
import IconButton from "@mui/material/IconButton";
import {MdClose, MdSave} from "react-icons/md";
import {TextField} from "@mui/material";
import {toggleRightContentBar} from "../../services/constants";

function ItemInfo(props) {
    const [item, setItem] = React.useState(props.item);
    const bar = useRef(null);

    React.useEffect(() => {
        setItem(props.item);
    }, [props.item]);

    React.useEffect(() => {
        toggleRightContentBar(bar);
    }, []);

    const info = item.info;

    return (
        <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
            <div className={"icon-bar"} style={{top: "0px", left: "0px", position: "absolute"}}>
                <IconButton onClick={() => toggleRightContentBar(bar, props.onClose)}>
                    <MdClose/>
                </IconButton>
                <IconButton onClick={() => toggleRightContentBar(bar, () => props.onSave(item))}>
                    <MdSave/>
                </IconButton>
            </div>
            <h3>Item</h3>
            <div><TextField
                variant="standard"
                label={"Amount"}
                fullWidth={true}
                value={item.amount}
                onChange={(e) => {
                    setItem({...item, amount: e.target.value})
                }} /></div>
            <h4>Description</h4>
            <div>{info.description}</div>
            <div><TextField
                variant="standard"
                label={"Flavor"}
                fullWidth={true}
                multiline={true}
                rows={4}
                rowsMax={15}
                value={item.description}
                onChange={(e) => {
                    setItem({...item, description: e.target.value})
                }} /></div>
            <div className={"basic-list"}>
                <div className={"item-prop-title"}>Name</div>
                <div>{info.name}</div>
                <div className={"item-prop-title"}>Category</div>
                <div>{info.category}</div>
                <div className={"item-prop-title"}>Value</div>
                <div>{info.value}</div>
                <div className={"item-prop-title"}>Weight</div>
                <div>{info.weight} lb.</div>
                {info.gear_category !== "Weapon" ? null :
                    <>
                        <h3>Weapon Properties</h3>
                        <div className={"item-prop-title"}>Weapon Category</div>
                        <div>{info.item_info.category_range}</div>
                        <div className={"item-prop-title"}>Damage</div>
                        <div>{info.item_info.damage.dice} {info.weapon.damage.type}</div>
                        {info.item_info.two_damage === null ? null :
                            <>
                                <div className={"item-prop-title"}>2h Damage</div>
                                <div>{info.weapon.two_damage.dice} {info.weapon.two_damage.type}</div>
                            </>
                        }
                        <div className={"item-prop-title"}>Range</div>
                        <div>{info.item_info.range.normal}{info.item_info.range.long === null ? null : "-" + info.item_info.range.long}</div>
                        {info.item_info.throw_range === null ? null :
                            <>
                                <div className={"item-prop-title"}>Throw Range</div>
                                <div>{info.item_info.throw_range.normal}-{info.item_info.throw_range.long}</div>
                            </>
                        }
                        <div className={"item-prop-title"}>Properties</div>
                        <div>{info.item_info.properties}</div>
                    </>}
            </div>
        </div>
    );
}

export default React.memo(ItemInfo);