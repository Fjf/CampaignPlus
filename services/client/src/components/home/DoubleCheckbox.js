import React from "react";
import {SvgIcon} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";


export default function DoubleCheckbox(props) {
    function getIcon() {
        if (props.value === 0) {
            return <>
                <path d="M250,375 a150 150 0 1 0 0,-250 a150 150 0 1 0 0,250 z"
                      fill="#ffffff" fillOpacity="0" stroke="#2a2626" strokeOpacity="1" strokeWidth="30"
                />
            </>
        } else if (props.value === 1) {
            return <>
                <path d="M250,375 a150 150 0 1 0 0,-250 a150 150 0 1 0 0,250 z"
                      fill="#ffffff" fillOpacity="0" stroke="#2a2626" strokeOpacity="1" strokeWidth="30"
                />
                <path d="M225,250 a110 110 0 1 0 0,-0.01 "
                      fill="#2a2626" fillOpacity="1"
                />
            </>
        } else {
            return <>
                <path d="M250,375 a150 150 0 1 0 0,-250 a150 150 0 1 0 0,250 z"
                      fill="#ffffff" fillOpacity="0" stroke="#2a2626" strokeOpacity="1" strokeWidth="30"
                />
                <path d="M225,250 a110 110 0 1 0 0,-0.01 h-170 a110 110 0 1 0 0,-0.01 "
                      fill="#2a2626" fillOpacity="1"
                />
            </>
        }
    }

    function clicked(e) {
        e.target = {};
        e.target.value = (props.value + 1) % 3;
        props.onClick(e);
    }

    return <IconButton style={{width: 28, height: 28}} onClick={clicked}>
        <SvgIcon viewBox={"0 0 500 500"}>
            {getIcon()}
        </SvgIcon>
    </IconButton>
}