import React from "react";
import { Redirect } from "react-router";
import { vaultCancel } from "../redux/account-actions";
import { connect } from "react-redux";
import { notifyError } from "../../../core/snackbar/redux/snackbar-actions";

interface Props {
  vaultCancel: typeof vaultCancel;
  notifyError: typeof notifyError;
}

const VaultCancel: React.FunctionComponent<Props> = props => {
  props.notifyError("Sign in attempt was cancelled");
  props.vaultCancel();
  return <Redirect to={"/user/login"} />;
};

const mapDispatchToProps = {
  vaultCancel,
  notifyError
};

export default connect(null, mapDispatchToProps)(VaultCancel);
