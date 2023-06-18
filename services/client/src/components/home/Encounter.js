import React from "react";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import {BsArrowDown, BsArrowUp, BsTrash} from "react-icons/bs";
import {TextField} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import {dataService} from "../services/dataService";
import Paper from '@mui/material/Paper';
import EnemyList from "./enemyComponents/EnemyList";
import "../../styles/enemy.scss";


function prepareRowData(rowData) {
    return {...rowData, current_hp: rowData.max_hp, initiative: 0};
}

function Row(props) {
    const {rowId, row, setRows} = props;
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        // First time we open a row, we check if we need to fetch abilities, otherwise use existing.
        if (row.abilities === undefined) {
            dataService.getAbilities(row.id).then(r => {
                row.abilities = r;
                setRows(rowId, row);
            });
        }
    }, []);

    return (
        <React.Fragment>
            <TableRow>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <BsArrowUp/> : <BsArrowDown/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.max_hp}</TableCell>
                <TableCell align="right"><TextField value={row.current_hp}
                                                    onChange={event => {
                                                        row.current_hp = event.target.value;
                                                        setRows(rowId, row); // Update storage.
                                                    }}/></TableCell>
                <TableCell align="right"><TextField type="number" value={row.initiative}
                                                    onChange={e => {
                                                        row.initiative = e.target.value;
                                                        setRows(rowId, row); // Update storage.
                                                    }}/></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1} style={{display: "flex", flexDirection: "row"}}>
                            <div style={{flex: 1}}>
                                <h3>Stats</h3>
                                <div>AC: {row.armor_class}</div>
                                <div>Str: {row.strength}</div>
                                <div>Dex: {row.dexterity}</div>
                                <div>Con: {row.constitution}</div>
                                <div>Int: {row.intelligence}</div>
                                <div>Wis: {row.wisdom}</div>
                                <div>Cha: {row.charisma}</div>
                            </div>

                            {row.abilities === undefined ? null :
                                <div style={{flex: 4}}>
                                    <h3>Abilities</h3>
                                    {row.abilities.map((ability, i) => {
                                        return <div key={i} style={{borderBottom: "1px solid #ffffff66"}}>
                                            {ability.text}
                                        </div>
                                    })}
                                </div>
                            }
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


export default function Encounter(props) {
    const [rows, setRows] = React.useState([]);
    const [enemies, setEnemies] = React.useState([]);

    React.useEffect(() => {
        dataService.getEnemies().then(r => setEnemies(r));
        const item = window.localStorage.getItem("encounter_rows");
        if (item !== null)
            setRows(JSON.parse(item));
    }, []);

    React.useEffect(() => {
        // Store encounter state to browser localstorage
        window.localStorage.setItem("encounter_rows", JSON.stringify(rows));
    }, [rows]);

    function updateRow(i, x) {
        rows[i] = x;
        setRows([...rows]);
    }

    return <>
        <div className={"left-content-bar"}>
            <EnemyList enemies={enemies} onClick={(enemy) => setRows([...rows, prepareRowData(enemy)])}/>
        </div>
        <div className={"main-content"}>
            <div className={"icon-bar"} style={{top: "8px", left: "8px", position: "absolute"}}>
                <IconButton variant={"outlined"} color={"secondary"} aria-label="hide"
                            onClick={() => {
                                setRows([]);
                            }}>
                    <BsTrash/>
                </IconButton>
            </div>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Max HP</TableCell>
                            <TableCell align="right">Current HP</TableCell>
                            <TableCell align="right">Initiative</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, i) => (
                            <Row key={i} rowId={i} row={row} setRows={updateRow}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </div>
    </>
}