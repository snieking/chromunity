import React, { useState } from "react";
import { createStyles, makeStyles, Snackbar } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";
import { COLOR_SOFT_PINK } from "../../../theme";
import CardContent from "@material-ui/core/CardContent";
import { User } from "../../../types";
import { getAccounts } from "../../../util/user-util";
import Account from "../Account";
import List from "@material-ui/core/List";
import { required, validate } from "../../../util/validations";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { submitLogin } from "../../../redux/actions/AccountActions";
import { ApplicationState } from "../../../redux/Store";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";

enum Step {
  INIT,
  LOGIN_IN_PROGRESS
}

const useStyles = makeStyles(
  createStyles({
    contentWrapper: {
      textAlign: "center",
      padding: "20px"
    },
    input: {
      marginTop: "10px"
    },
    signUpButton: {
      color: COLOR_SOFT_PINK,
      borderColor: COLOR_SOFT_PINK,
      "&:hover": {
        borderColor: COLOR_SOFT_PINK
      }
    }
  })
);

interface Props {
  loading: boolean;
  success: boolean;
  failure: boolean;
  login: typeof submitLogin;
}

const accounts = getAccounts();

const WalletLogin: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  const [step, setStep] = useState(Step.INIT);
  const [selectedAccount, setSelectedAccount] = useState<User>(accounts[0]);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const doLogin = () => {
    const validations = [
      [selectedAccount.name, [required("Please pick an account")]],
      [password, [required("Please enter a valid password")]]
    ];

    if (!validate(validations, setError)) {
      setErrorOpen(true);
      return;
    }

    setStep(Step.LOGIN_IN_PROGRESS);
    props.login(selectedAccount.name, password, selectedAccount.seed);
  };

  return (
    <Container maxWidth="sm">
      <ChromiaPageHeader text={"Login"} />
      <Card raised={true}>
        <CardContent className={classes.contentWrapper}>
          {props.loading && <CircularProgress disableShrink />}

          {step === Step.LOGIN_IN_PROGRESS &&
            props.success &&
            window.location.replace("/")}

          {accounts.length > 0 ? (
            <div>
              <Typography component="p" variant="subtitle1">
                Known Accounts
              </Typography>

              <List>
                {accounts.map(account => (
                  <Account
                    key={account.name}
                    user={account}
                    selectedAccount={selectedAccount || accounts[0]}
                    setSelectedAccount={setSelectedAccount}
                  />
                ))}
              </List>

              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                value={password || ""}
                onChange={({ target: { value } }) => setPassword(value)}
                variant="outlined"
                className={classes.input}
                autoFocus
              />
              <Button
                fullWidth
                color="primary"
                variant="outlined"
                className={classes.input}
                onClick={doLogin}
              >
                Sign in
              </Button>
            </div>
          ) : (
            <div>
              <Typography component="p" variant="subtitle1">
                No Known Accounts
              </Typography>
            </div>
          )}

          <Button
            component={Link}
            to="/wallet/import-account"
            color="secondary"
            variant="outlined"
            fullWidth
            className={classes.input}
          >
            Import existing account
          </Button>

          <Button
            component={Link}
            to="/wallet/sign-up"
            color="primary"
            variant="outlined"
            fullWidth
            className={classes.input}
          >
            Sign up
          </Button>

          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={errorOpen}
            autoHideDuration={6000}
            onClose={() => setErrorOpen(false)}
          >
            <CustomSnackbarContentWrapper variant="error" message={error} />
          </Snackbar>
        </CardContent>
      </Card>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    login: (name: string, password: string, seed: string) =>
      dispatch(submitLogin(name, password, seed))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.loginAccount.loading,
    success: store.loginAccount.success,
    failure: store.loginAccount.failure
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletLogin);
