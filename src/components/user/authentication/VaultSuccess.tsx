import React, { useEffect } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { parse } from "query-string";
import { connect } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import { vaultSuccess, resetLoginState } from "../redux/accountActions";
import { ApplicationState } from "../../../store";
import { ChromunityUser } from "../../../types";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";

interface MatchParams {
  username: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  vaultSuccess: typeof vaultSuccess;
  resetLoginState: typeof resetLoginState;
  user: ChromunityUser;
  error: string;
}

const useStyles = makeStyles({
  contentWrapper: {
    textAlign: "center"
  }
});

const VaultSuccess: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  useEffect(() => {
    const query = parse(props.location.search);
    const rawTx: string = query.rawTx as string;
    const username: string = props.match.params.username;

    if (rawTx && username) {
      props.vaultSuccess(rawTx, username);
    }
  }, [props]);

  if (props.error != null) {
    return <Redirect to={"/user/login"} />;
  } else if (props.user == null) {
    return (
      <>
        <LinearProgress variant="query" />
        <Container maxWidth="md" className={classes.contentWrapper}>
          <ChromiaPageHeader text={"Almost there!"} />
          <p>Please give us a second to authenticate you...</p>
        </Container>
      </>
    );
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
