import React from "react";
import ApplicationState from "../application-state";
import { LinearProgress } from "@material-ui/core";
import { connect } from "react-redux";

interface Props {
  queryPending: boolean;
  operationPending: boolean;
}

const Spinners: React.FunctionComponent<Props> = (props) => {
  return <>
    {props.queryPending && (<LinearProgress variant="query" />)}
    {props.operationPending && (<LinearProgress color="secondary" />)}
  </>;
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    queryPending: store.common.queryPending,
    operationPending: store.common.operationPending
  };
};

export default connect(mapStateToProps) (Spinners);
