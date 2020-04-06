import React, { useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { parse } from "query-string";
import { connect } from "react-redux";
import { createStyles, LinearProgress, Snackbar } from "@material-ui/core";
import { registerUser, resetLoginState, vaultCancel, vaultSuccess } from "../redux/accountActions";
import { ApplicationState } from "../../../store";
import { ChromunityUser } from "../../../types";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { AuthenticationStep } from "../redux/accountTypes";
import Button from "@material-ui/core/Button";
import { ReactComponent as LeftShapes } from "../../static/graphics/left-shapes.svg";
import { ReactComponent as RightShapes } from "../../static/graphics/right-shapes.svg";

interface Props extends RouteComponentProps {
  vaultSuccess: typeof vaultSuccess;
  vaultCancel: typeof vaultCancel;
  resetLoginState: typeof resetLoginState;
  registerUser: typeof registerUser;
  authenticationStep: AuthenticationStep;
  loading: boolean;
  user: ChromunityUser;
  error: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    contentWrapper: {
      textAlign: "center"
    },
    textInput: {
      marginTop: "10px",
      marginBottom: "20px",
      width: "250px"
    },
    btnInput: {
      marginTop: "10px",
      marginBottom: "20px",
      width: "100px"
    },
    leftShapes: {
      [theme.breakpoints.down("sm")]: {
        display: "none"
      },
      float: "left"
    },
    rightShapes: {
      [theme.breakpoints.down("sm")]: {
        display: "none"
      },
      float: "right"
    }
  })
);

const VaultSuccess: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const query = parse(props.location.search);
    const rawTx: string = query.rawTx as string;
    if (rawTx) {
      props.vaultSuccess(rawTx);
    } else {
      props.vaultCancel("Bad data received from vault");
    }
    // eslint-disable-next-line
  }, []);

  const selectUsername = () => {
    if (/\s/.test(name)) {
      setErrorMsg("Username may not contain whitespace");
      setErrorOpen(true);
      setName("");
    } else if (!/[a-zA-Z0-9]{3,16}/.test(name)) {
      setErrorMsg(
        "Username must start with a a-z, A-Z or 0-9 character. Username should have a size between 3-16 characters."
      );
      setErrorOpen(true);
      setName("");
    } else {
      props.registerUser(name);
    }
  };

  const body = () => {
    return (
      <Container maxWidth="md" className={classes.contentWrapper}>
        {authentication()}
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={errorOpen}
          autoHideDuration={3000}
          onClose={() => setErrorOpen(false)}
        >
          <CustomSnackbarContentWrapper variant="error" message={errorMsg} />
        </Snackbar>
      </Container>
    );
  };

  const authentication = () => {
    if (props.error != null) {
      return <Redirect to={"/user/login"} />;
    } else if (
      props.authenticationStep == null ||
      props.authenticationStep === AuthenticationStep.CONFIRMING_VAULT_TRANSACTION ||
      props.authenticationStep === AuthenticationStep.VAULT_IN_PROGRESS
    ) {
      return waitingForConfirmation("Almost there!", "Give us a second to authenticate you...");
    } else if (props.authenticationStep === AuthenticationStep.USERNAME_INPUT_REQUIRED) {
      return registerNewUser();
    } else if (props.authenticationStep === AuthenticationStep.REGISTERING_USER) {
      return waitingForConfirmation("Registering...", "Just a sec while we set up your account!");
    } else if (props.authenticationStep === AuthenticationStep.AUTHENTICATED) {
      return <Redirect to={"/"} />;
    } else {
      return <Redirect to={"/user/login"} />;
    }
  };

  const waitingForConfirmation = (title: string, message: string) => {
    return (
      <>
        <LinearProgress variant="query" />
        <ChromiaPageHeader text={title} />
        <LeftShapes className={classes.leftShapes} />
        <RightShapes className={classes.rightShapes} />
        <p>{message}</p>
      </>
    );
  };

  const registerNewUser = () => {
    return (
      <Container maxWidth="md" className={classes.contentWrapper}>
        <ChromiaPageHeader text={"It looks like you're new here!"} />
        <LeftShapes className={classes.leftShapes} />
        <RightShapes className={classes.rightShapes} />
        <p>By which name would you like to be referred to?</p>
        <TextField
          label="Username"
          name="name"
          type="text"
          variant="outlined"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          className={classes.textInput}
        />
        <br />
        <Button color="primary" variant="contained" className={classes.btnInput} onClick={selectUsername}>
          Continue
        </Button>
      </Container>
    );
  };

  return body();
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.account.loading,
    user: store.account.user,
    error: store.account.error,
    authenticationStep: store.account.authenticationStep
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    vaultSuccess: (accountId: string, username: string, vaultPubKey: string) =>
      dispatch(vaultSuccess(accountId, username, vaultPubKey)),
    vaultCancel: (error: string) => dispatch(vaultCancel(error)),
    registerUser: (username: string) => dispatch(registerUser(username))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VaultSuccess);
