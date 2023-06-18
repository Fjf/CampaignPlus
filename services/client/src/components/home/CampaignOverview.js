import IconButton from "@mui/material/IconButton";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {Collapse} from "@mui/material";
import React from "react";
import {campaignService} from "../services/campaignService";
import {Link} from "react-router-dom";
import Button from "@mui/material/Button";
import {MdSave} from "react-icons/md";
import {FaPlusCircle, FaTrash} from "react-icons/fa";
import TextField from "@mui/material/TextField";

export default function CampaignOverview(props) {
    const campaigns = props.campaigns;
    const setCampaigns = props.setCampaigns;
    const [selectedCampaign, setSelectedCampaign] = React.useState(null);

    const [players, setPlayers] = React.useState([]);
    const [playerToggled, setPlayerToggled] = React.useState([]);

    function getPlayers(campaignId) {
        campaignService.getData(campaignId).then(r => {
            setPlayers(r);
            setPlayerToggled(new Array(r.length).fill(true));
        });
    }

    function togglePlayerList(i) {
        let p;
        if (i === undefined) {
            p = new Array(playerToggled.length).fill(!playerToggled.some((i) => i));
        } else {
            p = [...playerToggled];
            p[i] = !p[i];
        }
        setPlayerToggled(p);
    }

    function saveChanges() {
        campaignService.update(selectedCampaign.id, selectedCampaign).then(r => {
            setSelectedCampaign(r);
        })
    }

    function selectCampaign(campaign) {
        if (campaign !== null) {
            setSelectedCampaign(campaign);
            getPlayers(campaign.id);
        } else {
            setSelectedCampaign(campaign);
            setPlayers([]);
        }
    }

    function deleteCampaign() {
        if (prompt("Are you sure you want to delete this campaign? Type the name of the campaign to continue deleting.") === selectedCampaign.name) {
            campaignService.del(selectedCampaign.id).then(r => {
                props.setCampaigns(r);
                selectCampaign(null);
            })
        }
    }

    return <>
        <div className={"left-content-bar"}>
            <div className={"basic-list-entry"}><h3>Campaigns</h3>
                <div className={"icon-bar"}>
                    <IconButton aria-label="add" size={"small"} onClick={() => {
                        campaignService.create().then(r => {
                            setCampaigns([...campaigns, r]);
                            selectCampaign(r);
                        });
                    }}>
                        <FaPlusCircle/>
                    </IconButton>
                </div>
            </div>
            {
                campaigns.map((campaign, i) => {
                    return <div key={i}
                                className={"campaign-list-entry"}
                                onClick={() => selectCampaign(campaigns[i])}>
                        <div>{campaign.name}</div>
                        <div>{campaign.is_owner ? "You" : campaign.owner}</div>
                    </div>
                })
            }
        </div>
        {selectedCampaign === null ?
            <div className={"main-content"}>Select a campaign to show information here.</div> :
            <div className={"main-content"}>
                <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute"}}>
                    <IconButton
                        onClick={saveChanges}
                    >
                        <MdSave/>
                    </IconButton>
                    <IconButton
                        onClick={deleteCampaign}
                    >
                        <FaTrash/>
                    </IconButton>
                </div>
                <div className={"player-list-wrapper"}>
                    <div className={"player-list-entry"}>
                        <div>
                            <h3>Players </h3>
                            <IconButton size="small" onClick={() => togglePlayerList()}>
                                {playerToggled.some((i) => i) ? <ArrowUpwardIcon fontSize="inherit"/>
                                    : <ArrowDownwardIcon fontSize="inherit"/>}
                            </IconButton>
                        </div>
                    </div>

                    <div className={"player-list"}>
                        {
                            players.map((player, i) => {
                                return <Collapse
                                    in={playerToggled[i]}
                                    key={i}
                                    collapsedSize={"24px"}
                                >
                                    <div className={"player-list-entry"}>
                                        <div>
                                            <div>
                                                <b>{player.name}</b> (by {player.owner})
                                            </div>
                                            <IconButton size="small" onClick={() => togglePlayerList(i)}>
                                                {playerToggled[i] ? <ArrowUpwardIcon fontSize="inherit"/>
                                                    : <ArrowDownwardIcon fontSize="inherit"/>}
                                            </IconButton>
                                        </div>
                                        <div>Race: {player.race}</div>
                                        <div>Class: {player.class}</div>
                                        <div>Level: {player.info.stats.level}</div>
                                    </div>
                                </Collapse>
                            })
                        }
                    </div>
                </div>
                <div className={"join-section"}>
                    <TextField
                        variant="standard"
                        value={selectedCampaign.name}
                        onChange={
                            (e) => {
                                setSelectedCampaign({
                                    ...selectedCampaign,
                                    name: e.target.value
                                })
                            }
                        } /><h3>(by {selectedCampaign.owner})</h3>
                    <div>Campaign code: {selectedCampaign.code}</div>
                    <img style={{width: "80px", height: "80px"}} src={"/static/images/qr_codes/" + selectedCampaign.code + ".png"}/>
                </div>
            </div>
        }</>;

}