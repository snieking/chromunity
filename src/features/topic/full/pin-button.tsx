import React, { useEffect, useState } from 'react';
import PinDropIcon from '@material-ui/icons/PinDrop';
import { connect } from 'react-redux';
import { ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import ApplicationState from '../../../core/application-state';
import { ChromunityUser } from '../../../types';
import { toLowerCase } from '../../../shared/util/util';
import { pinTopic, checkPinnedTopicByRep } from '../../governing/redux/gov-actions';
import { COLOR_ORANGE } from '../../../theme';
import ConfirmDialog from '../../../shared/confirm-dialog';
import { isRepresentative } from '../../../shared/util/user-util';

interface Props {
  topicId: string;
  handleClose: () => void;
  user: ChromunityUser;
  rateLimited: boolean;
  representatives: string[];
  topicIdPinnedByMe: string;
  pinTopic: typeof pinTopic;
  checkPinnedTopicByRep: typeof checkPinnedTopicByRep;
}

const PinButton: React.FunctionComponent<Props> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isRepresentative(props.user, props.representatives)) {
      props.checkPinnedTopicByRep();
    }
    // eslint-disable-next-line
  }, [props.representatives, props.user]);

  const isPinnedByMe = () =>
    isRepresentative(props.user, props.representatives) &&
    props.topicIdPinnedByMe &&
    props.topicIdPinnedByMe === props.topicId;

  const openDialog = () => {
    props.handleClose();
    setDialogOpen(true);
  };

  const confirm = () => {
    setDialogOpen(false);
    props.pinTopic(props.topicId);
  };

  const cancel = () => {
    setDialogOpen(false);
  };

  const pinButton = () => {
    return (
      <>
        <ConfirmDialog
          text="You may only have one active pin at the same time."
          subText=" Topics with the most pins from representatives will be displayed at the top."
          open={dialogOpen}
          onClose={cancel}
          onConfirm={confirm}
        />
        <MenuItem onClick={openDialog} disabled={props.rateLimited || isPinnedByMe()}>
          <ListItemIcon>
            <PinDropIcon style={{ color: isPinnedByMe() ? COLOR_ORANGE : '' }} />
          </ListItemIcon>
          <Typography>Pin topic</Typography>
        </MenuItem>
      </>
    );
  };

  return isRepresentative(props.user, props.representatives) && pinButton();
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited,
    topicIdPinnedByMe: store.government.topicIdPinnedByMe,
  };
};

const mapDispatchToProps = {
  pinTopic,
  checkPinnedTopicByRep,
};

export default connect(mapStateToProps, mapDispatchToProps)(PinButton);
