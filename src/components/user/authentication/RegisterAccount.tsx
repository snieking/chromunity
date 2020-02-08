import React, { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { parse } from "query-string";
import { accountRegister } from "../redux/accountActions";
import { connect } from "react-redux";
import { LinearProgress } from "@material-ui/core";

interface MatchParams {
  username: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  accountRegister: typeof accountRegister;
}

const RegisterAccount: React.FunctionComponent<Props> = props => {
  const query = parse(props.location.search);
  const accountId: string = query.accountId as string;
  const vaultPubKey: string = query.pubKey as string;
  const username: string = props.match.params.username;

  useEffect(() => {
    props.accountRegister(accountId, username, vaultPubKey);
    // eslint-disable-next-line
  }, [accountId, username, vaultPubKey]);
  return <LinearProgress variant="query" />;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    accountRegister: (accountId: string, username: string, vaultPubKey: string) =>
      dispatch(accountRegister(accountId, username, vaultPubKey))
  };
};

export default connect(null, mapDispatchToProps)(RegisterAccount);
