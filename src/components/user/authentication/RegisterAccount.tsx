import React from "react";
import { RouteComponentProps } from "react-router";
import { parse } from "query-string";
import { accountRegister } from "../../../redux/actions/AccountActions";
import { connect } from "react-redux";
import { ApplicationState } from "../../../redux/Store";

interface MatchParams {
  username: string;
  accountId: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  accountRegister: typeof accountRegister;
}

const RegisterAccount: React.FunctionComponent<Props> = props => {
  const query = parse(props.location.search);
  const accountId: string = query.accountId as string;
  const vaultPubKey: string = query.pubKey as string;
  const username: string = props.match.params.username;
  props.accountRegister(accountId, username, vaultPubKey);

  return (
    <div>
      <p>AccountId: {accountId}</p>
      <p>Username: {username}</p>
      <p>PubKey: {vaultPubKey}</p>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    accountRegister: (
      accountId: string,
      username: string,
      vaultPubKey: string
    ) => dispatch(accountRegister(accountId, username, vaultPubKey))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterAccount);
