import * as React from "react";
import "../styles/audioplayer.scss"
import ToggleButton from '@material-ui/lab/ToggleButton';
import {GiHeavyRain} from "react-icons/all";

const rainAudio = new Audio("/static/audio/rain.mp3");
rainAudio.loop = true;

export default function AudioPlayer(props) {
    const [rain, setRain] = React.useState(false);

    React.useEffect(() => {
        if (!rainAudio.paused) {
            rainAudio.pause();
        } else {
            rainAudio.play();
        }
    }, [rain]);

    return <div className={"audio-player-bar"}>
        <ToggleButton
            value="check"
            selected={rain}
            onChange={() => {
                setRain(!rain);
            }}
        >
            <GiHeavyRain/>
        </ToggleButton>
    </div>

}