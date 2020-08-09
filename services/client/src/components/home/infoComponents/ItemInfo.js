import React, {useRef} from "react";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle, MdClose, MdSave} from "react-icons/all";
import {TextField} from "@material-ui/core";
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

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
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
            label={"Amount"}
            fullWidth={true}
            value={item.amount}
            onChange={(e) => {
                setItem({...item, amount: e.target.value})
            }}
        /></div>
        <div><TextField
            label={"Flavor"}
            fullWidth={true}
            multiline={true}
            rows={4}
            value={item.extra_info}
            onChange={(e) => {
                setItem({...item, extra_info: e.target.value})
            }}
        /></div>
        <div className={"basic-list"}>
            <div className={"item-prop-title"}>Name</div>
            <div>{info.name}</div>
            <div className={"item-prop-title"}>Category</div>
            <div>{info.category}</div>
            <div className={"item-prop-title"}>Value</div>
            <div>{info.value}</div>
            <div className={"item-prop-title"}>Weight</div>
            <div>{info.weight} lb.</div>
            {info.weapon === null ? null :
                <>
                    <h3>Weapon Properties</h3>
                    <div className={"item-prop-title"}>Weapon Category</div>
                    <div>{info.weapon.category_range}</div>
                    <div className={"item-prop-title"}>Damage</div>
                    <div>{info.weapon.damage.dice} {info.weapon.damage.type}</div>
                    {info.weapon.two_damage === null ? null :
                        <>
                            <div className={"item-prop-title"}>2h Damage</div>
                            <div>{info.weapon.two_damage.dice} {info.weapon.two_damage.type}</div>
                        </>
                    }
                    <div className={"item-prop-title"}>Range</div>
                    <div>{info.weapon.range.normal}{info.weapon.range.long === null ? null : "-" + info.weapon.range.long}</div>
                    {info.weapon.throw_range === null ? null :
                        <>
                            <div className={"item-prop-title"}>Throw Range</div>
                            <div>{info.weapon.throw_range.normal}-{info.weapon.throw_range.long}</div>
                        </>
                    }
                    <div className={"item-prop-title"}>Properties</div>
                    <div>{info.weapon.properties}</div>
                </>}
        </div>
    </div>
}

export default React.memo(ItemInfo);