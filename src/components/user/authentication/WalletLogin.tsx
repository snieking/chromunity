import React, { useState } from "react";
import { createStyles, makeStyles, Snackbar } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";
import CardContent from "@material-ui/core/CardContent";
import { getAccounts } from "../../../util/user-util";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { initWalletLogin } from "../../../redux/actions/AccountActions";
import { ApplicationState } from "../../../redux/Store";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
import { makeKeyPair } from "../../../blockchain/Postchain";
import { uniqueId } from "../../../util/util";
import Typography from "@material-ui/core/Typography";

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
    }
  })
);

interface Props {
  loading: boolean;
  success: boolean;
  failure: boolean;
  initWalletLogin: typeof initWalletLogin;
}

const accounts = getAccounts();

const WalletLogin: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  const [step, setStep] = useState(Step.INIT);
  const [error, setError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const walletLogin = () => {
    const dappId = "chromunity";
    const accountId = uniqueId();
    const keyPair = makeKeyPair();

    setStep(Step.LOGIN_IN_PROGRESS);
    props.initWalletLogin(accountId, keyPair);

    const href = `https://wallet-v2.chromia.dev/?route=/authorize&dappId=${dappId}&accountId=${accountId}&pubKey=${keyPair.pubKey}`;

    var newWindow = window.open(
      href,
      "vault",
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!newWindow.focus) {
      newWindow.focus();
    }
  };

  return (
    <Container maxWidth="sm" className={classes.contentWrapper}>
      <ChromiaPageHeader text={"Login"} />
      {props.loading && <CircularProgress disableShrink />}
      {step === Step.INIT && (
        <div>
          <Typography variant="subtitle1" component="p">
            User authentication is handled by the Chromia Vault.
          </Typography>
          <Button
            color="primary"
            variant="contained"
            className={classes.input}
            onClick={walletLogin}
          >
            Sign in with Chromia Vault
          </Button>
        </div>
      )}
      {step === Step.LOGIN_IN_PROGRESS &&
        props.success &&
        window.location.replace("/")}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
      >
        <CustomSnackbarContentWrapper variant="error" message={error} />
      </Snackbar>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    initWalletLogin: (accountId: string, keyPair: any) =>
      dispatch(initWalletLogin(accountId, keyPair))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.walletLogin.loading,
    success: store.walletLogin.success
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletLogin);
