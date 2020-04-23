import React from "react";
import { ApplicationState } from "../../store";
import { clearError, clearInfo } from "./redux/snackbarTypes";
import { connect } from "react-redux";
import { Snackbar } from "@material-ui/core";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";

interface Props {
  error: boolean;
  errorMsg: string;
  info: boolean;
  infoMsg: string;
  clearError: typeof clearError;
  clearInfo: typeof clearInfo;
}

const SnackbarHolder: React.FunctionComponent<Props> = (props) => {
  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={props.info}
        autoHideDuration={3000}
        onClose={props.clearInfo}
      >
        <CustomSnackbarContentWrapper variant="success" message={props.infoMsg} />
      </Snackbar>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={props.error}
        autoHideDuration={3000}
        onClose={props.clearError}
      >
        <CustomSnackbarContentWrapper variant="error" message={props.errorMsg} />
      </Snackbar>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    error: store.snackbar.error,
    errorMsg: store.snackbar.errorMsg,
    info: store.snackbar.info,
    infoMsg: store.snackbar.infoMsg,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearError: () => dispatch(clearError()),
    clearInfo: () => dispatch(clearInfo()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SnackbarHolder);
