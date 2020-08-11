import React from "react";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import {BsArrowDown, BsArrowUp} from "react-icons/all";
import {TextField} from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import Box from "@material-ui/core/Box";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import {dataService} from "../services/dataService";
import Paper from '@material-ui/core/Paper';
import EnemyList from "./enemyComponents/EnemyList";
import "../../styles/enemy.scss";


function Row(props) {
    const {row} = props;
    const [open, setOpen] = React.useState(false);

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
                <TableCell align="right"><TextField defaultValue={row.max_hp}/></TableCell>
                <TableCell align="right"><TextField defaultValue={0}/></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            test123
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
    }, []);

    return <>
        <div className={"left-content-bar"}>
            <EnemyList enemies={enemies} onClick={(enemy) => setRows([...rows, enemy])}/>
        </div>
        <div className={"main-content"}>
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
                            <Row key={i} row={row}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </div>
    </>
}