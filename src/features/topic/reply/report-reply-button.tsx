import React, { useState, useEffect } from 'react';
import { ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import { Report } from '@material-ui/icons';
import { connect } from 'react-redux';
import { ChromunityUser, TopicReply } from '../../../types';
import { hasReportedReply, reportReply } from '../../../core/services/representatives-service';
import ConfirmDialog from '../../../shared/confirm-dialog';
import { isRepresentative } from '../../../shared/util/user-util';
import ApplicationState from '../../../core/application-state';
import { setOperationPending, setRateLimited } from '../../../shared/redux/common-actions';
import { notifyInfo, notifyError } from '../../../core/snackbar/redux/snackbar-actions';

interface Props {
  user: ChromunityUser;
  reply: TopicReply;
  representatives: string[];
  rateLimited: boolean;
  setOperationPending: typeof setOperationPending;
  notifyInfo: typeof notifyInfo;
  notifyError: typeof notifyError;
  setRateLimited: typeof setRateLimited;
  onConfirm: () => void;
}

const ReportReplyButton: React.FunctionComponent<Props> = (props) => {
  const [reported, setReported] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (props.user && props.reply) {
      setReported(hasReportedReply(props.user, props.reply));
    }
  }, [props.user, props.reply]);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  function reportTheReply() {
    closeDialog();
    props.onConfirm();
    props.setOperationPending(true);

    reportReply(props.user, props.reply)
      .catch((error) => {
        props.notifyError(error.message);
        props.setRateLimited();
      })
      .then(() => {
        setReported(true);
        props.notifyInfo('Reply has been reported');
      })
      .finally(() => props.setOperationPending(false));
  }

  if (!props.user) {
    return null;
  }

  return (
    <>
      <ConfirmDialog
        text="This action will report the reply"
        open={dialogOpen}
        onClose={closeDialog}
        onConfirm={reportTheReply}
      />
      <MenuItem
        onClick={openDialog}
        disabled={props.rateLimited || reported || isRepresentative(props.user, props.representatives)}
      >
        <ListItemIcon>
          <Report />
        </ListItemIcon>
        <Typography>Report</Typography>
      </MenuItem>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited,
    representatives: store.government.representatives,
  };
};

const mapDispatchToProps = {
  notifyError,
  notifyInfo,
  setRateLimited,
  setOperationPending,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportReplyButton);
