import {timeAgoReadable} from "../../util/util";
import {Typography} from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    timestamp: {
        color: theme.palette.primary.main,
        fontSize: "12px"
    }
}));

interface Props {
    milliseconds: number
}

const Timestamp: React.FunctionComponent<Props> = (props) => {
    const classes = useStyles(props);
    return (
        <Typography className={classes.timestamp} variant='inherit' component='p'>
            {timeAgoReadable(props.milliseconds)}
        </Typography>
    )
};

export default Timestamp;