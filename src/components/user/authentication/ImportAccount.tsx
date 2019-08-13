import React, { useState } from "react";
import { Container, createStyles, Snackbar } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import EnterSeedForm from "./forms/EmterSeedForm";
import AccountCredentialsForm from "./forms/AccountCredentialsForm";
import { connect } from "react-redux";
import { ApplicationState } from "../../../redux/Store";
import { importLogin, importSeed } from "../../../redux/actions/AccountActions";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";

enum Step {
  ENTER_SEED,
  ENTER_CREDENTIALS,
  LOGIN_ASYNC
}

interface Props {
  loading: boolean;
  storeSeed: typeof importSeed;
  login: typeof importLogin;
  success: boolean;
  failure: boolean;
  error: string;
}

const useStyles = makeStyles(
  createStyles({
    content: {
      textAlign: "center",
      padding: "20px"
    }
  })
);

const ImportAccount: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [step, setStep] = useState(Step.ENTER_SEED);

  const handleEnterSeedFormContinue = (seed: string) => {
    props.storeSeed(seed);
    setStep(Step.ENTER_CREDENTIALS);
  };

  const handleAccountCredentialsFormContinue = (
    name: string,
    password: string
  ) => {
    props.login(name, password);
    setStep(Step.LOGIN_ASYNC);
  };

  return (
    <Container maxWidth="sm">
      <ChromiaPageHeader text={"Import Existing Account"} />
      <Card raised={true}>
        <CardContent className={classes.content}>
          {props.loading && <CircularProgress disableShrink />}
          {step === Step.ENTER_SEED && (
            <EnterSeedForm onContinue={handleEnterSeedFormContinue} />
          )}
          {step === Step.ENTER_CREDENTIALS && (
            <AccountCredentialsForm
              onContinue={handleAccountCredentialsFormContinue}
            />
          )}
          {step === Step.LOGIN_ASYNC &&
            props.success &&
            window.location.replace("/")}
          {step === Step.LOGIN_ASYNC &&
            props.failure &&
            setStep(Step.ENTER_SEED)}
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={props.failure}
            autoHideDuration={6000}
            onClose={() => setStep(Step.ENTER_SEED)}
          >
            <CustomSnackbarContentWrapper
              variant="error"
              message={props.error}
            />
          </Snackbar>
        </CardContent>
      </Card>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    storeSeed: (seed: string) => dispatch(importSeed(seed)),
    login: (name: string, password: string) =>
      dispatch(importLogin(name, password))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.importAccount.loading,
    success: store.importAccount.success,
    failure: store.importAccount.failure,
    error: store.importAccount.error
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportAccount);
