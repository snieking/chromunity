import React from "react";
import { RouteComponentProps } from "react-router";
import { accountLogin } from "../redux/accountActions";
import { LinearProgress } from "@material-ui/core";
import { connect } from "react-redux";

interface MatchParams {
  accountId: string;
  username: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  accountLogin: typeof accountLogin;
}

const LoginAccount: React.FunctionComponent<Props> = props => {
  props.accountLogin(props.match.params.username, props.match.params.accountId);
  return <LinearProgress variant="query" />;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    accountLogin: (username: string, accountId: string) => dispatch(accountLogin(username, accountId))
  };
};

export default connect(null, mapDispatchToProps)(LoginAccount);
