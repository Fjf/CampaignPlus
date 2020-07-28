import IconButton from "@material-ui/core/IconButton";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {Collapse} from "@material-ui/core";
import EnemyCreation from "./EnemyCreation";
import React from "react";
import {campaignService} from "../services/campaignService";
import {Link} from "react-router-dom";
import Button from "@material-ui/core/Button";


export default function CampaignOverview(props) {
    const campaign = props.campaign;

    const [players, setPlayers] = React.useState([]);
    const [playerToggled, setPlayerToggled] = React.useState([]);

    React.useEffect(() => {
        campaignService.getData(campaign.id).then(r => {
            setPlayers(r);
            setPlayerToggled(new Array(r.length).fill(true));
        });
    }, []);


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

    return <div className={"main-content"}>
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
                            collapsedHeight={"24px"}
                        >
                            <div className={"player-list-entry"}>
                                <div>
                                    <div><b>{player.name}</b> (by {player.user_name})</div>
                                    <IconButton size="small" onClick={() => togglePlayerList(i)}>
                                        {playerToggled[i] ? <ArrowUpwardIcon fontSize="inherit"/>
                                            : <ArrowDownwardIcon fontSize="inherit"/>}
                                    </IconButton>
                                </div>
                                <div>{player.race}</div>
                                <div>{player.class}</div>
                                <div>{player.backstory}</div>
                            </div>
                        </Collapse>
                    })
                }
            </div>
        </div>
        <div className={"join-section"}>
            <h2>{campaign.name} (by {campaign.owner})</h2>
            <img style={{width: "80px", height: "80px"}} src={campaign.qr_image}/>
        </div>
        {!campaign.is_owner ? null :
            <Link to={"/enemies"}><Button>Go to enemy creation.</Button></Link>}
    </div>
}