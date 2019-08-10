import React from 'react';
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

export interface ChromiaHeaderProps {
    text: string;
}

const ChromiaPageHeader: React.FunctionComponent<ChromiaHeaderProps> = (props: ChromiaHeaderProps) => {
    const classes = useStyles(props);
    return (
        <div className={classes.header}>
            <Typography variant="h5" component="h5" className="pink-typography">
                {props.text}
            </Typography>
        </div>
    );
};

const useStyles = makeStyles({
    header: {
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "10px"
    }
});

export default ChromiaPageHeader;