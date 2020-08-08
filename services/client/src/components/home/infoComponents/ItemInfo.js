import React from "react";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle, MdClose} from "react-icons/all";

export default function ItemInfo(props) {
    const item = props.item;

    return <div className={"right-content-bar"}>
        <div className={"icon-bar"} style={{top: "8px", left: "8px", position: "absolute"}}>
            <IconButton size={"small"} onClick={props.onClose}>
                <MdClose/>
            </IconButton>
        </div>
        <h3>Item</h3>
        <div className={"basic-list"}>
            <div className={"item-prop-title"}>Name</div>
            <div>{item.name}</div>
            <div className={"item-prop-title"}>Category</div>
            <div>{item.category}</div>
            <div className={"item-prop-title"}>Value</div>
            <div>{item.value}</div>
            <div className={"item-prop-title"}>Weight</div>
            <div>{item.weight} lb.</div>
            {item.weapon === null ? null :
                <>
                    <h3>Weapon Properties</h3>
                    <div className={"item-prop-title"}>Weapon Category</div>
                    <div>{item.weapon.category_range}</div>
                    <div className={"item-prop-title"}>Damage</div>
                    <div>{item.weapon.damage.dice} {item.weapon.damage.type}</div>
                    {item.weapon.two_damage === null ? null :
                        <>
                            <div className={"item-prop-title"}>2h Damage</div>
                            <div>{item.weapon.two_damage.dice} {item.weapon.two_damage.type}</div>
                        </>
                    }
                    <div className={"item-prop-title"}>Range</div>
                    <div>{item.weapon.range.normal}{item.weapon.range.long === null ? null : "-" + item.weapon.range.long}</div>
                    {item.weapon.throw_range === null ? null :
                        <>
                            <div className={"item-prop-title"}>Throw Range</div>
                            <div>{item.weapon.throw_range.normal}-{item.weapon.throw_range.long}</div>
                        </>
                    }
                    <div className={"item-prop-title"}>Properties</div>
                    <div>{item.weapon.properties}</div>
                </>}
        </div>
    </div>
}