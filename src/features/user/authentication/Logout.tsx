import React, { useEffect } from "react";
import ApplicationState from "../../../core/application-state";
import { logoutAccount } from "../redux/accountActions";
import { connect } from "react-redux";
import { ChromunityUser } from "../../../types";
import { LinearProgress } from "@material-ui/core";
import { Redirect } from "react-router";

interface Props {
  logoutAccount: typeof logoutAccount;
  user: ChromunityUser;
}

const Logout: React.FC<Props> = props => {

  useEffect(() => {
    props.logoutAccount();
    // eslint-disable-next-line
  }, []);

  if (props.user) {
    return <LinearProgress variant="query" />;
  } else {
    return <Redirect to={"/"} />
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

const mapDispatchToProps = {
  logoutAccount
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
