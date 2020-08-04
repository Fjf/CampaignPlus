import {BrowserRouter, Link, Route} from "react-router-dom";
import React from "react";
import "../../styles/main.scss"
import {campaignService} from "../services/campaignService";
import CampaignOverview from "./CampaignOverview";
import EnemyCreation from "./EnemyCreation";
import AudioPlayer from "../AudioPlayer";
import {userService} from "../services/userService";
import Profile from "./Profile";
import MapWidget from "./MapWidget";
import {dataService} from "../services/dataService";

export default function Home(props) {
    const [campaigns, setCampaigns] = React.useState([]);
    const [user, setUser] = React.useState(userService.getUser());

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
                <Link to="/">
                    <div>Home</div>
                </Link>
                <Link to="/maps">
                    <div>Maps</div>
                </Link>
                <Link to="/enemies">
                    <div>Enemies</div>
                </Link>
                {user === null ?
                <Link to="/login">
                    <div>Login</div>
                </Link>
                :
                <>
                    <Link to="/profile">
                        <div>{user.name}</div>
                    </Link>
                    <div onClick={() => userService.logout().then(r => {
                        history.push('/login')
                    })}>Logout</div>
                </>
            }
                    <Link to="/login">
                        <div>Login</div>
                    </Link> :
                    <><div>{user.name}</div>
                        <div onClick={() => {
                            userService.logout().then(
                                setUser(userService.getUser())
                            )}}
                        >Logout</div>
                    </>
                }
            </nav>
            <div className={"content-wrapper"}>
                <Route exact path={"/"}>
                    <CampaignOverview campaigns={campaigns} setCampaigns={setCampaigns}/>
                </Route>
                <Route exact path={"/enemies"}>
                    <EnemyCreation campaigns={campaigns}/>
                </Route>
                <Route exact path={"/maps"}>
                    <MapWidget campaigns={campaigns}/>
                </Route>
                <Route exact path={"/profile"}>
                <Profile user={user}/>

            </Route>
            </div>
        </div>
        <AudioPlayer/>
    </>
}