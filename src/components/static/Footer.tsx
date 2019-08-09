import React from 'react';
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {COLOR_SOFT_PINK} from "../../theme";

const Footer: React.FunctionComponent = (props) => {
    const classes = useStyles(props);
    return (
        <footer className={classes.footer}>
            <Typography className={classes.text}>
                Powered by <a className={classes.link} href="https://chromia.com"><b>Chromia</b></a> - Source code at <a
                className={classes.link} href="https://github.com/snieking/chromunity"><b>GitHub</b></a>
            </Typography>
        </footer>
    );
};

const useStyles = makeStyles({
    footer: {
        width: "100%",
        position: "relative",
        textAlign: "center",
        marginBottom: "10px"
    },
    link: {
        textDecoration: "none",
        color: "inherit"
    },
    text: {
        fontSize: "12px",
        color: COLOR_SOFT_PINK
    }
});

export default Footer;