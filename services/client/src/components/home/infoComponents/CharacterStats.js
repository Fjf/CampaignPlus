import IconButton from "@material-ui/core/IconButton";
import {BsDiamond, BsDiamondFill, GoArrowDown, GoArrowUp} from "react-icons/all";
import {Checkbox, TextField} from "@material-ui/core";
import React from "react";


function CharacterStats(props) {
    const info = props.info;
    const setInfo = props.setInfo;
    const notEditing = props.notEditing;

    function getProficiencyBonus() {
        return Math.round((info.level - 1) / 4) + 2;
    }

    return <div className={"stats-column"}>
        <div className={"basic-list-entry"}>
            <IconButton size={"small"} onClick={e => setInfo({
                ...info,
                level: Math.max(1, info.level - 1)
            })}><GoArrowDown/></IconButton>
            <h3>lvl</h3>
            <IconButton size={"small"} onClick={e => setInfo({
                ...info,
                level: Math.min(20, info.level + 1)
            })}><GoArrowUp/></IconButton>
        </div>
        <div className={"level-stat"}>
            {info.level}
        </div>
        <div><h3>Proficiency</h3></div>
        <div className={"proficiency-stat"}>
            {getProficiencyBonus()}
        </div>
        <div>Strength</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.strength}
                onChange={(e) => setInfo({
                    ...info,
                    strength: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_str}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_str: e.target.value

                })}
            />
        </div>
        <div>Dexterity</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.dexterity}
                onChange={(e) => setInfo({
                    ...info,
                    dexterity: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_dex}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_dex: e.target.value

                })}
            />
        </div>
        <div>Constitution</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.constitution}
                onChange={(e) => setInfo({
                    ...info,
                    constitution: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_con}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_con: e.target.value

                })}
            />
        </div>
        <div>Intelligence</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.intelligence}
                onChange={(e) => setInfo({
                    ...info,
                    intelligence: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_int}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_int: e.target.value

                })}
            />
        </div>
        <div>Wisdom</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.wisdom}
                onChange={(e) => setInfo({
                    ...info,
                    wisdom: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_wis}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_wis: e.target.value

                })}
            />
        </div>
        <div>Charisma</div>
        <div className={"stats-duo"}>
            <TextField
                disabled={notEditing}
                value={info.charisma}
                onChange={(e) => setInfo({
                    ...info,
                    charisma: e.target.value

                })}
            />
            <Checkbox
                disabled={notEditing}
                value={info.saving_throws_cha}
                size={"small"}
                icon={<BsDiamond/>}
                checkedIcon={<BsDiamondFill/>}
                onChange={(e) => setInfo({
                    ...info,
                    saving_throws_cha: e.target.value
                })}
            />
        </div>
    </div>
}

export default React.memo(CharacterStats);