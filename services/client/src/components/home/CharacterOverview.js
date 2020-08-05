import React from "react";
import {characterServices} from "../services/characterServices";
import {Checkbox, TextField} from "@material-ui/core";
import "../../styles/profile.scss";
import {BsDiamond, BsDiamondFill} from "react-icons/all";

export default function CharacterOverview(props) {
    const character = props.character;
    const [characterInfo, setCharacterInfo] = React.useState(null);
    const [notEditing, setNotEditing] = React.useState(false);

    React.useEffect(() => {
        characterServices.getCharacterInfo(character.id).then(r => {
            setCharacterInfo(r);
        });
    }, []);

    return <div className={"main-content"}>
        {characterInfo === null ? null :
            <div className={"stats-column"}>
                <div>Strength</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.strength}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                strength: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_str}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_str: e.target.value
                            }
                        })}
                    />
                </div>
                <div>Dexterity</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.dexterity}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                dexterity: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_dex}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_dex: e.target.value
                            }
                        })}
                    />
                </div>
                <div>Constitution</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.constitution}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                constitution: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_con}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_con: e.target.value
                            }
                        })}
                    />
                </div>
                <div>Intelligence</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.intelligence}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                intelligence: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_int}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_int: e.target.value
                            }
                        })}
                    />
                </div>
                <div>Wisdom</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.wisdom}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                wisdom: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_wis}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_wis: e.target.value
                            }
                        })}
                    />
                </div>
                <div>Charisma</div>
                <div className={"stats-duo"}>
                    <TextField
                        disabled={notEditing}
                        value={characterInfo.info.charisma}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                charisma: e.target.value
                            }
                        })}
                    />
                    <Checkbox
                        disabled={notEditing}
                        value={characterInfo.saving_throws_cha}
                        size={"small"}
                        icon={<BsDiamond/>}
                        checkedIcon={<BsDiamondFill/>}
                        onChange={(e) => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                saving_throws_cha: e.target.value
                            }
                        })}
                    />
                </div>
            </div>
        }
    </div>
}