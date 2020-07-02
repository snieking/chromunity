import React, { useState } from 'react';
import { IconButton, Menu, Tooltip } from '@material-ui/core';
import { LocationCity } from '@material-ui/icons';
import { connect } from 'react-redux';
import { TopicReply, ChromunityUser } from '../../../types';
import ApplicationState from '../../../core/application-state';
import DeleteReplyButton from './delete-reply-button';
import { isRepresentative } from '../../../shared/util/user-util';

interface Props {
  reply: TopicReply;
  user: ChromunityUser;
  representatives: string[];
}

const GoverningReplyActions: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!isRepresentative(props.user, props.representatives)) {
    return null;
  }

  return (
    <>
      <Menu id="gov-actions" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <DeleteReplyButton reply={props.reply} handleClose={handleClose} />
      </Menu>
      <IconButton onClick={handleClick}>
        <Tooltip title="Governing">
          <LocationCity />
        </Tooltip>
      </IconButton>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives,
  };
};

export default connect(mapStateToProps)(GoverningReplyActions);
