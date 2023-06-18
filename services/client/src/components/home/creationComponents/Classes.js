import IconButton from "@mui/material/IconButton";
import React, {useRef} from "react";
import {MdClose} from "react-icons/md";
import TextField from "@mui/material/TextField";
import {toggleRightContentBar} from "../../services/constants";
import {dataService} from "../../services/dataService";
import {FileDrop} from "react-file-drop";


let classStorage = null;
Classes.defaultProps = {
    closeOnSelect: false
};

export default function Classes(props) {
    const [query, setQuery] = React.useState("");
    const [filteredClasses, setFilteredClasses] = React.useState([]);
    const [classes, setClasses] = React.useState([]);
    const [classData, setClassData] = React.useState("");
    const bar = useRef(null);

    React.useEffect(() => {
        if (classStorage !== null) {
            setClasses(classStorage);
        } else {
            dataService.getClasses().then(r => {
                setClasses(r);
            });
        }
    }, []);

    React.useEffect(() => {
        let fItems = classes;
        if (typeof (props.filter) === "function") {
            fItems = fItems.filter(props.filter);
        }
        setFilteredClasses(fItems.filter((val) => val.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, classes]);

    function uploadFile(files, event) {
        /*
         * Upload the zip
         */
        let file = files[0];
        console.log(file.name);
        if (!file.name.endsWith(".zip")) {
            alert("Only zip files are supported.");
            return
        }

        dataService.addClasses(file).then((r) => {
            console.log("Uploaded zip successfully.");
            setClasses(r);
        });
    }

    return <>
        <div style={{overflowY: "scroll", height: "100%", flex: 3}}>
        <pre style={{whiteSpace: "pre-wrap"}}>
            <code>{classData}</code>
        </pre>
        </div>
        <div className={"right-content-bar-fixed"}>
            <div>
                <h3>Items</h3>
                <IconButton size={"small"} onClick={() => {
                    toggleRightContentBar(bar, props.onClose)
                }}
                            style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
            </div>
            <div style={{border: "2px dash black"}}>
                <FileDrop
                    onDrop={uploadFile}
                >
                    Drop a zip here to overwrite/create new classes.
                    Only your own classes can be overwritten.
                </FileDrop>
            </div>
            <TextField
                variant="standard"
                label={"Search"}
                value={query}
                onChange={(e) => setQuery(e.target.value)} />
            <div className={"items-list"}>
                {filteredClasses.map((item, i) => {
                    return <div key={i} onClick={() => {
                        setClassData(JSON.stringify(item, null, 2));
                    }}>
                        <div>{item.name}</div>
                        <div>{item.owner_name}</div>
                    </div>
                })}
            </div>
        </div>
    </>;
}