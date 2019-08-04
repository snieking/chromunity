import React from 'react';
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";


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
    }
});

const Footer: React.FunctionComponent = (props) => {
    const classes = useStyles(props);
    return (
        <footer className={classes.footer}>
            <Typography className="pink-color" style={{fontSize: "12px"}}>
                Powered by <a className={classes.link} href="https://chromia.com"><b>Chromia</b></a> - Source code at <a
                className={classes.link} href="https://github.com/snieking/chrotonomy"><b>GitHub</b></a>
            </Typography>
        </footer>
    );
};

export default Footer;