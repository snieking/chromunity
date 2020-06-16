import React, { useState } from "react";
import { ChromunityUser } from "../../../types";
import { toLowerCase } from "../../../shared/util/util";
import { connect } from "react-redux";
import { ApplicationState } from "../../../core/store";
import ConfirmDialog from "../../../shared/ConfirmDialog";
import { removeTopic, REMOVE_TOPIC_OP_ID, hasReportedId } from "../../../core/services/RepresentativesService";
import { setError, notifySuccess } from "../../../core/snackbar/redux/snackbarTypes";
import { setRateLimited } from "../../../shared/redux/CommonActions";
import { MenuItem, ListItemIcon, Typography } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { COLOR_RED } from "../../../theme";

interface Props {
  topicId: string;
  handleClose: Function;
  user: ChromunityUser;
  rateLimited: boolean;
  representatives: string[];
  setError: typeof setError;
  setInfo: typeof notifySuccess;
  setRateLimited: typeof setRateLimited;
}

const DeleteButton: React.FunctionComponent<Props> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <ConfirmDialog
        text={
          "This action will remove the topic, which makes sure that no one will be able to read the initial message."
        }
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          setDialogOpen(false);
          removeTopic(props.user, props.topicId)
            .catch((error) => {
              setError(error.message);
              setRateLimited();
            })
            .then(() => window.location.reload());
        }}
      />
      <MenuItem onClick={() => props.handleClose()} disabled={props.rateLimited || hasReportedId(REMOVE_TOPIC_OP_ID + ":" + props.topicId)}>
        <ListItemIcon>
          <Delete style={{ color: COLOR_RED }}/>
        </ListItemIcon>
        <Typography>Delete topic</Typography>
      </MenuItem>
    </>
  );
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setInfo: (msg: string) => dispatch(notifySuccess(msg)),
    setRateLimited: () => dispatch(setRateLimited())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteButton);
