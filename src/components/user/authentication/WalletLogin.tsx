import React, { useState } from "react";
import { createStyles, makeStyles, Snackbar } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { accountRegisteredCheck } from "../../../redux/actions/AccountActions";
import { ApplicationState } from "../../../redux/Store";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect } from "react-redux";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

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
    textField: {
      marginBottom: "5px"
    }
  })
);

interface Props {
  loading: boolean;
  success: boolean;
  failure: boolean;
  error: string;
  accountRegisteredCheck: typeof accountRegisteredCheck;
}

const WalletLogin: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  const [name, setName] = useState("");
  const [step, setStep] = useState(Step.INIT);
  const [errorOpen, setErrorOpen] = useState(props.failure);

  const walletLogin = () => {
    setStep(Step.LOGIN_IN_PROGRESS);
    props.accountRegisteredCheck(name);
  };

  return (
    <Container maxWidth="sm" className={classes.contentWrapper}>
      <ChromiaPageHeader text={"Login"} />
      {props.loading && <CircularProgress disableShrink />}
      {step === Step.INIT && (
        <div>
          <Typography variant="subtitle1" component="p" className={classes.textField}>
            User authentication is handled by Chromia Wallet.
          </Typography>
          <TextField
            label="Account name"
            name="name"
            type="text"
            fullWidth
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
            className={classes.input}
          />
          <Button
            color="primary"
            variant="contained"
            className={classes.input}
            onClick={walletLogin}
          >
            Sign in with Chromia Wallet
          </Button>
        </div>
      )}
      {step === Step.LOGIN_IN_PROGRESS && (
        <Typography variant="subtitle1" component="p">
          If you do not see anything, make sure you allow pop-ups.
        </Typography>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
      >
        <CustomSnackbarContentWrapper variant="error" message={props.error} />
      </Snackbar>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    accountRegisteredCheck: (username: string) =>
      dispatch(accountRegisteredCheck(username))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.account.loading,
    success: store.account.success,
    error: store.account.error,
    failure: store.account.failure
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletLogin);
