import React, { useState, useEffect } from 'react';
import { MenuItem, ListItemIcon, Typography } from '@material-ui/core';
import { connect } from 'react-redux';
import { Report } from '@material-ui/icons';
import ConfirmDialog from '../../../shared/confirm-dialog';
import { ChromunityUser } from '../../../types';
import { setOperationPending, setRateLimited } from '../../../shared/redux/common-actions';
import { notifyError, notifyInfo } from '../../../core/snackbar/redux/snackbar-actions';
import ApplicationState from '../../../core/application-state';
import { reportTopic, hasReportedTopic } from '../../../core/services/representatives-service';
import { isRepresentative } from '../../../shared/util/user-util';

interface Props {
  topicId: string;
  user: ChromunityUser;
  representatives: string[];
  rateLimited: boolean;
  setOperationPending: typeof setOperationPending;
  notifyInfo: typeof notifyInfo;
  notifyError: typeof notifyError;
  setRateLimited: typeof setRateLimited;
  onConfirm: () => void;
}

const ReportButton: React.FunctionComponent<Props> = (props) => {
  const [reported, setReported] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (props.user && props.topicId) {
      setReported(hasReportedTopic(props.user, props.topicId));
    }
  }, [props.user, props.topicId]);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const reportTheTopic = () => {
    const { user } = props;

    props.setOperationPending(true);
    props.onConfirm();

    reportTopic(user, props.topicId)
      .catch((error) => {
        props.notifyError(error.message);
        props.setRateLimited();
      })
      .then(() => {
        setReported(true);
        props.notifyInfo('Topic has been reported');
      })
      .finally(() => props.setOperationPending(false));
  };

  if (!props.user || reported || isRepresentative(props.user, props.representatives)) {
    return null;
  }

  return (
    <>
      <ConfirmDialog
        text="This action will report the topic"
        open={dialogOpen}
        onClose={closeDialog}
        onConfirm={reportTheTopic}
      />
      <MenuItem onClick={openDialog} disabled={props.rateLimited}>
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

export default connect(mapStateToProps, mapDispatchToProps)(ReportButton);
