import React, { useEffect } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { parse } from "query-string";
import { connect } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import { vaultSuccess, resetLoginState } from "../redux/accountActions";
import { ApplicationState } from "../../../store";
import { ChromunityUser } from "../../../types";

interface MatchParams {
  username: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  vaultSuccess: typeof vaultSuccess;
  resetLoginState: typeof resetLoginState;
  user: ChromunityUser;
  error: string;
}

const VaultSuccess: React.FunctionComponent<Props> = props => {
  const query = parse(props.location.search);
  const rawTx: string = query.rawTx as string;
  const username: string = props.match.params.username;

  useEffect(() => {
    if (rawTx && username) {
      props.vaultSuccess(rawTx, username);
    }
  }, [rawTx, username]);

  if (props.error != null) {
    return <Redirect to={"/user/login"} />;
  } else if (props.user == null) {
    return <LinearProgress variant="query" />;
  } else {
    return <Redirect to={"/"} />;
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    error: store.account.error
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    vaultSuccess: (accountId: string, username: string, vaultPubKey: string) =>
      dispatch(vaultSuccess(accountId, username, vaultPubKey))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VaultSuccess);
