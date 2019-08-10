import {timeAgoReadable} from "../../util/util";
import {Typography} from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {COLOR_SOFT_PINK} from "../../theme";


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

const useStyles = makeStyles({
    timestamp: {
        color: COLOR_SOFT_PINK,
        fontSize: "12px"
    }
});

export default Timestamp;