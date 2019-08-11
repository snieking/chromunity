import React, { useState } from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../../redux/Store";
import {
  createCredentials,
  register
} from "../../../redux/actions/AccountActions";
import { Container, createStyles } from "@material-ui/core";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Card from "@material-ui/core/Card";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CardContent from "@material-ui/core/CardContent";
import AccountCredentialsForm from "./forms/AccountCredentialsForm";
import ViewSeedForm from "./forms/ViewSeedForm";
import VerifySeedForm from "./forms/VerifySeedForm";
import CircularProgress from "@material-ui/core/CircularProgress";

enum Step {
  CREATE_CREDENTIALS,
  VIEW_SEED,
  VERIFY_SEED,
  REGISTER_ASYNC
}

const useStyles = makeStyles(
  createStyles({
    content: {
      textAlign: "center",
      padding: "20px"
    }
  })
);

interface Props {
  loading: boolean;
  createCredentials: typeof createCredentials;
  register: typeof register;
  name: string;
  password: string;
  seed: string;
  success: boolean;
  failure: boolean;
}

const CreateAccount: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [step, setStep] = useState<Step>(Step.CREATE_CREDENTIALS);

  const handleAccountCredentialsFormContinue = (
    name: string,
    password: string
  ) => {
    props.createCredentials(name, password);
    setStep(Step.VIEW_SEED);
  };

  const handleViewSeedFormContinue = () => {
    setStep(Step.VERIFY_SEED);
  };

  const handleVerifySeedFormContinue = () => {
    props.register();
    setStep(Step.REGISTER_ASYNC);
  };

  return (
    <Container maxWidth="sm">
      <ChromiaPageHeader text={"Create New Account"} />
      <Card raised={true}>
        <CardContent className={classes.content}>
          {props.loading && <CircularProgress disableShrink />}
          {step === Step.CREATE_CREDENTIALS && (
            <AccountCredentialsForm
              onContinue={handleAccountCredentialsFormContinue}
            />
          )}
          {step === Step.VIEW_SEED && (
            <ViewSeedForm
              seed={props.seed}
              onContinue={handleViewSeedFormContinue}
            />
          )}
          {step === Step.VERIFY_SEED && (
            <VerifySeedForm
              seed={props.seed}
              onContinue={handleVerifySeedFormContinue}
            />
          )}
          {step === Step.REGISTER_ASYNC &&
            props.success &&
            window.location.replace("/")}
        </CardContent>
      </Card>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    createCredentials: (name: string, password: string) =>
      dispatch(createCredentials(name, password)),
    register: () => dispatch(register())
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.createAccount.loading,
    name: store.createAccount.name,
    password: store.createAccount.password,
    seed: store.createAccount.seed,
    success: store.createAccount.success,
    failure: store.createAccount.failure
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateAccount);
