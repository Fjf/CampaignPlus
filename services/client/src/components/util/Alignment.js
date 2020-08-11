import Grid from "@material-ui/core/Grid";
import React from "react";
import Button from "@material-ui/core/Button";
import "../../styles/utils/alignment.scss"

export default function Alignment(props) {
    const [selection, setSelection] = React.useState(null);

    React.useEffect(() => {
        if (selection === null) return;
        props.onChange(selection);
    }, [selection]);

    const alignments = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"]

    return <div className={"alignment-container"}>
        <Grid container spacing={1}>
            {
                alignments.map((value, i) => {
                    return <Grid key={i} item xs={4}>
                        <Button
                            variant={"outlined"}
                            onClick={() => {
                                setSelection(value)
                            }}
                            disabled={selection === value}
                        >{value}</Button>
                    </Grid>
                })
            }
        </Grid>
    </div>
}