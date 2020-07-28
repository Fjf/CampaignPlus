import * as React from "react";
import "../styles/audioplayer.scss"

export default function AudioPlayer(props) {
    let rain;

    React.useEffect(() => {
        rain = new Audio("/static/audio/rain.mp3");
    });

    return <div className={"audio-player-bar"}>
        Dit is de audio player.
    </div>

}