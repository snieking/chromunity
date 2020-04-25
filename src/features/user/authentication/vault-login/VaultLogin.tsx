import React from "react";
import { ApplicationState } from "../../../../core/store";
import { connect } from "react-redux";
import { loginAccount, setAuthenticationStep } from "../../redux/accountActions";
import { AuthenticationStep } from "../../redux/accountTypes";
import VaultLoginPresentation from "./VaultLoginPresentation";

interface Props {
  authenticationStep: AuthenticationStep;
  loading: boolean;
  loginAccount: typeof loginAccount;
  setAuthenticationStep: typeof setAuthenticationStep;
}

const VaultLogin: React.FunctionComponent<Props> = (props) => {
  const login = () => {
    props.setAuthenticationStep(AuthenticationStep.VAULT_IN_PROGRESS);
    props.loginAccount();
  };

  return <VaultLoginPresentation loading={props.loading} authenticationStep={props.authenticationStep} login={login} />;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loginAccount: () => dispatch(loginAccount()),
    setAuthenticationStep: (step: AuthenticationStep) => dispatch(setAuthenticationStep(step)),
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    authenticationStep: store.account.authenticationStep,
    loading: store.account.loading,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VaultLogin);
