import React from "react";
import { createStyles, makeStyles, Snackbar } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { ApplicationState } from "../../../store";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
import Typography from "@material-ui/core/Typography";
import { ReactComponent as LeftShapes } from "../../static/graphics/left-shapes.svg";
import { ReactComponent as RightShapes } from "../../static/graphics/right-shapes.svg";
import { loginAccount, resetLoginState, setAuthenticationStep } from "../redux/accountActions";
import { AuthenticationStep } from "../redux/accountTypes";

const useStyles = makeStyles(theme =>
  createStyles({
    contentWrapper: {
      textAlign: "center",
      padding: "20px"
    },
    outerWrapper: {
      position: "relative"
    },
    innerWrapper: {
      maxWidth: "400px",
      margin: "0 auto"
    },
    input: {
      marginTop: "10px"
    },
    textField: {
      marginBottom: "5px"
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



interface Props {
  authenticationStep: AuthenticationStep;
  loading: boolean;
  success: boolean;
  failure: boolean;
  error: string;
  loginAccount: typeof loginAccount;
  resetLoginState: typeof resetLoginState;
  setAuthenticationStep: typeof setAuthenticationStep;
}

const WalletLogin: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  const walletLogin = () => {
    props.setAuthenticationStep(AuthenticationStep.VAULT_IN_PROGRESS);
    props.loginAccount();
  };

  return (
    <Container maxWidth="md" className={classes.contentWrapper}>
      <ChromiaPageHeader text={"Login"} />
      {props.loading && <CircularProgress disableShrink />}
      {props.authenticationStep == null && (
        <div>
          <LeftShapes className={classes.leftShapes} />
          <RightShapes className={classes.rightShapes} />
          <div className={classes.innerWrapper}>
            <Typography variant="subtitle1" component="p" className={classes.textField}>
              User authentication is provided by the Chromia Vault
            </Typography>
            <Button color="primary" variant="contained" fullWidth className={classes.input} onClick={walletLogin}>
              Sign In with Vault
            </Button>
          </div>
        </div>
      )}
      {props.authenticationStep === AuthenticationStep.VAULT_IN_PROGRESS && (
        <Typography variant="subtitle1" component="p">
          Redirecting to Chromia Vault...
        </Typography>
      )}

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={props.error != null}
        autoHideDuration={6000}
        onClose={props.resetLoginState}
      >
        <CustomSnackbarContentWrapper variant="error" message={props.error} />
      </Snackbar>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loginAccount: () => dispatch(loginAccount()),
    resetLoginState: () => dispatch(resetLoginState()),
    setAuthenticationStep: (step: AuthenticationStep) => dispatch(setAuthenticationStep(step))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    authenticationStep: store.account.authenticationStep,
    loading: store.account.loading,
    error: store.account.error
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletLogin);
