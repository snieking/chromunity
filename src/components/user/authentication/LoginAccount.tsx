import React from "react";
import { RouteComponentProps } from "react-router";
import { accountLogin } from "../../../redux/actions/AccountActions";
import { LinearProgress } from "@material-ui/core";
import { ApplicationState } from "../../../redux/Store";
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

const mapStateToProps = (store: ApplicationState) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginAccount);
