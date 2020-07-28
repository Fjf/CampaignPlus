import * as React from "react";
import "../styles/audioplayer.scss"
import ToggleButton from '@material-ui/lab/ToggleButton';
import {FaWind, GiCaveEntrance, GiCricket, GiDropletSplash, GiHeavyRain, MdStore} from "react-icons/all";
import Grid from "@material-ui/core/Grid";
import {Pause, PlayArrow, VolumeDown, VolumeUp} from "@material-ui/icons";
import Slider from "@material-ui/core/Slider";

const fileNames = ["rain", "cave", "crickets", "forest_wind", "market"];
const files = {};
fileNames.forEach((name) => {
    files[name] = new Audio(`/static/audio/${name}.mp3`);
});

let audio = files["rain"];
let volume = 0.5;
audio.volume = volume;

function togglePlay(paused) {
    if (audio === null) return;

    audio.volume = volume;
    audio.loop = true;
    if (paused) {
        audio.pause();
    } else {
        audio.play();
    }
}

export default function AudioPlayer(props) {
    const [playing, setPlaying] = React.useState("rain");
    const [paused, setPaused] = React.useState(true);

    React.useEffect(() => {
        togglePlay(paused);
    }, [paused]);

    React.useEffect(() => {
        audio.pause();
        audio = files[playing];
        togglePlay(paused);
    }, [playing]);

    return <Grid className={"audio-player-bar"} container spacing={0}>
        <Grid item>
            <VolumeDown/>
        </Grid>
        <Grid item>
            <Slider
                style={{width: "200px"}}
                defaultValue={0.5}
                min={0}
                max={1}
                step={0.01}
                onChange={(e, newValue) => {
                    volume = newValue;
                    audio.volume = volume;
                }} aria-labelledby="continuous-slider"/>
        </Grid>
        <Grid item>
            <VolumeUp/>
        </Grid>
        <Grid item onClick={() => setPaused(!paused)}>
            {paused ? <PlayArrow/> : <Pause/>}
        </Grid>
        <Grid item>
            <ToggleButton
                value="check"
                selected={playing === "rain"}
                onChange={() => {
                    setPlaying("rain");
                }}>
                <GiHeavyRain/>
            </ToggleButton>
        </Grid>
        <Grid item>
            <ToggleButton
                value="check"
                selected={playing === "cave"}
                onChange={() => {
                    setPlaying("cave");
                }}>
                <GiDropletSplash/>
            </ToggleButton>
        </Grid>
        <Grid item>
            <ToggleButton
                value="check"
                selected={playing === "crickets"}
                onChange={() => {
                    setPlaying("crickets");
                }}>
                <GiCricket/>
            </ToggleButton>
        </Grid>
        <Grid item>
            <ToggleButton
                value="check"
                selected={playing === "forest_wind"}
                onChange={() => {
                    setPlaying("forest_wind");
                }}>
                <FaWind/>
            </ToggleButton>
        </Grid>
        <Grid item>
            <ToggleButton
                value="check"
                selected={playing === "market"}
                onChange={() => {
                    setPlaying("market");
                }}>
                <MdStore/>
            </ToggleButton>
        </Grid>
    </Grid>


}