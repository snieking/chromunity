import React, { useState } from "react";
import { ChromunityUser } from "../../../types";
import { connect } from "react-redux";
import ApplicationState from "../../../core/application-state";
import ConfirmDialog from "../../../shared/confirm-dialog";
import { removeTopic, REMOVE_TOPIC_OP_ID, hasReportedId } from "../../../core/services/representatives-service";
import { notifyError } from "../../../core/snackbar/redux/snackbar-actions";
import { setRateLimited } from "../../../shared/redux/common-actions";
import { MenuItem, ListItemIcon, Typography } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { COLOR_RED } from "../../../theme";

interface Props {
  topicId: string;
  handleClose: Function;
  user: ChromunityUser;
  rateLimited: boolean;
  notifyError: typeof notifyError;
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
        props.notifyError(error.message);
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

const mapDispatchToProps = {
  notifyError,
  setRateLimited
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteButton);
