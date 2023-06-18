import React from "react";
import "../../styles/main.scss"
import {campaignService} from "../services/campaignService";
import CampaignOverview from "./CampaignOverview";
import EnemyCreation from "./EnemyCreation";
import AudioPlayer from "../AudioPlayer";
import {userService} from "../services/userService";
import {useNavigate, Routes, Route, Link} from "react-router-dom"
import Profile from "./Profile";
import MapWidget from "./MapWidget";
import Encounter from "./Encounter";
import Classes from "./creationComponents/Classes";
import BattleMap from "../battlemap/BattleMap";

export default function Home(props) {
    const [campaigns, setCampaigns] = React.useState([]);
    const [user, setUser] = React.useState(userService.getUser());
    const history = useNavigate();

    React.useEffect(() => {
        if (user === null) return;
        // Load campaigns on initialization, and when user changes
        campaignService.get().then(r => {
            setCampaigns(r)
        });
    }, [user]);


    return <>
        <div className={"page-wrapper"}>
            <nav className={"title-bar"}>
                <Link to="">
                    <div>Home</div>
                </Link>
                <Link to="maps">
                    <div>Maps</div>
                </Link>
                <Link to="classes">
                    <div>Classes</div>
                </Link>
                <Link to="enemies">
                    <div>Enemies</div>
                </Link>
                <Link to="encounter">
                    <div>Encounter</div>
                </Link>
                {user === null ?
                    <Link to="login">
                        <div>Login</div>
                    </Link> :
                    <> <Link to="profile">
                        <div>{user.name}</div>
                    </Link>
                        <div onClick={() => {
                            setUser(null);
                            userService.logout().then(r => {
                                console.log("Logout successful.")
                            });
                            history.push('/login')
                        }}
                        >Logout
                        </div>
                    </>
                }
            </nav>
            <div className={"content-wrapper"}>
                <Routes>
                    <Route exact path={""}
                           element={<CampaignOverview campaigns={campaigns} setCampaigns={setCampaigns}/>}/>
                    <Route exact path={"enemies"} element={<EnemyCreation campaigns={campaigns}/>}/>
                    <Route exact path={"maps"} element={<MapWidget campaigns={campaigns} widget={Map}/>}/>
                    <Route exact path={"battle_map"} element={<BattleMap/>}/>
                    <Route exact path={"classes"} element={<Classes/>}/>
                    <Route exact path={"profile"} element={<Profile user={user}/>}/>
                    <Route exact path={"encounter"} element={<Encounter/>}/>
                </Routes>
            </div>
        </div>
        <AudioPlayer/>
    </>
}