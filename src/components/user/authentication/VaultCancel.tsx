import React from "react";
import { Redirect } from "react-router";
import { vaultCancel } from "../redux/accountActions";
import { connect } from "react-redux";

interface Props {
  vaultCancel: typeof vaultCancel;
}

const VaultCancel: React.FunctionComponent<Props> = props => {
  props.vaultCancel();
  return <Redirect to={"/user/login"} />;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    vaultCancel: () => dispatch(vaultCancel("Sign in attempt was cancelled"))
  };
};

export default connect(null, mapDispatchToProps)(VaultCancel);
