import React, { useState } from 'react';
import { MenuItem, ListItemIcon, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { connect } from 'react-redux';
import ConfirmDialog from '../../../shared/confirm-dialog';
import { COLOR_RED } from '../../../theme';
import { ChromunityUser, TopicReply } from '../../../types';
import { notifyError } from '../../../core/snackbar/redux/snackbar-actions';
import { setRateLimited, setOperationPending } from '../../../shared/redux/common-actions';
import ApplicationState from '../../../core/application-state';
import { deleteReply } from '../../../core/services/topic-service';

interface Props {
  reply: TopicReply;
  handleClose: () => void;
  user: ChromunityUser;
  rateLimited: boolean;
  notifyError: typeof notifyError;
  setRateLimited: typeof setRateLimited;
  setOperationPending: typeof setOperationPending;
}

const DeleteReplyButton: React.FunctionComponent<Props> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const open = (): void => {
    setDialogOpen(true);
    props.handleClose();
  };

  const close = (): void => setDialogOpen(false);

  const deleteTheReply = () => {
    props.setOperationPending(true);
    deleteReply(props.user, props.reply.id)
      .then(() => window.location.reload())
      .catch((error: Error) => {
        props.notifyError(error.message);
        props.setRateLimited();
      })
      .finally(() => props.setOperationPending(false));
  };

  return (
    <>
      <ConfirmDialog
        text="This action will remove the topic, which makes sure that no one will be able to read the initial message."
        open={dialogOpen}
        onConfirm={deleteTheReply}
        onClose={close}
      />
      <MenuItem onClick={open} disabled={props.rateLimited}>
        <ListItemIcon>
          <Delete style={{ color: COLOR_RED }} />
        </ListItemIcon>
        <Typography>Delete reply</Typography>
      </MenuItem>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = {
  notifyError,
  setRateLimited,
  setOperationPending,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteReplyButton);
