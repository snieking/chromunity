import React, { useState } from "react";
import { ChromunityUser } from "../../../types";
import { connect } from "react-redux";
import { ApplicationState } from "../../../core/store";
import ConfirmDialog from "../../../shared/ConfirmDialog";
import { removeTopic, REMOVE_TOPIC_OP_ID, hasReportedId } from "../../../core/services/RepresentativesService";
import { setError } from "../../../core/snackbar/redux/snackbarTypes";
import { setRateLimited } from "../../../shared/redux/CommonActions";
import { MenuItem, ListItemIcon, Typography } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { COLOR_RED } from "../../../theme";

interface Props {
  topicId: string;
  handleClose: Function;
  user: ChromunityUser;
  rateLimited: boolean;
  setError: typeof setError;
  setRateLimited: typeof setRateLimited;
}

const DeleteButton: React.FunctionComponent<Props> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const close = () => setDialogOpen(false);

  const open = () => {
    props.handleClose();
    setDialogOpen(true);
  }

  const confirm = () => {
    close();
    removeTopic(props.user, props.topicId)
      .catch((error) => {
        setError(error.message);
        setRateLimited();
      })
      .then(() => window.location.reload());
  }

  const isDisabled = () => props.rateLimited || hasReportedId(REMOVE_TOPIC_OP_ID + ":" + props.topicId);

  return (
    <>
      <ConfirmDialog
        text={
          "This action will remove the topic, which makes sure that no one will be able to read the initial message."
        }
        open={dialogOpen}
        onClose={close}
        onConfirm={confirm}
      />
      <MenuItem onClick={open} disabled={isDisabled()}>
        <ListItemIcon>
          <Delete style={{ color: COLOR_RED }} />
        </ListItemIcon>
        <Typography>Delete topic</Typography>
      </MenuItem>
    </>
  );
}

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setRateLimited: () => dispatch(setRateLimited())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteButton);
