import React, {useState} from 'react';
import {createStyles, makeStyles} from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";

const useStyles = makeStyles(createStyles({
    paper: {
        textAlign: "center"
    },
    contentWrapper: {
        padding: "20px",
        display: "block"
    },
    knownAccountsLabel: {},
    passwordField: {
        width: "80%",
        marginTop: "20px",
        marginBottom: "20px"
    },
    button: {
        width: "60%"
    }
}));

const WalletLogin: React.FunctionComponent = (props: any) => {
    const classes = useStyles(props);

    const [password, setPassword] = useState<string>("");

    return (
        <Container maxWidth="sm">
            <ChromiaPageHeader text={"Login"}/>
            <Card raised={true} className={classes.paper}>
                <div className={classes.contentWrapper}>
                    <Typography component="p" variant="subtitle1" className={classes.knownAccountsLabel}>
                        Known Accounts
                    </Typography>

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        fullWidth
                        value={password || ''}
                        onChange={({target: {value}}) => setPassword(value)}
                        variant="outlined"
                        className={classes.passwordField}
                        autoFocus
                    />
                    <Button color="primary" variant="outlined" className={classes.button}>Sign in</Button>
                    <br/>
                    <Typography component="span" variant="subtitle1" className={classes.knownAccountsLabel}>
                        OR
                    </Typography>
                    <br/>
                    <Button color="secondary" variant="outlined" className={classes.button}>Import existing
                        account</Button>
                </div>
            </Card>
        </Container>
    )
    
};

export default WalletLogin;