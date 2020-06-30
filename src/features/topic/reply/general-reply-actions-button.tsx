import React, { useState } from 'react';
import { IconButton, Tooltip, Menu } from '@material-ui/core';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import { connect } from 'react-redux';
import { TopicReply, ChromunityUser } from '../../../types';
import ReportReplyButton from './report-reply-button';
import ApplicationState from '../../../core/application-state';

interface Props {
  user: ChromunityUser;
  reply: TopicReply;
}

const GeneralReplyActionsButton: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!props.user) {
    return null;
  }

  return (
    <>
      <Menu id="reply-actions" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <ReportReplyButton reply={props.reply} onConfirm={handleClose} />
      </Menu>
      <IconButton onClick={handleClick}>
        <Tooltip title="Actions">
          <MenuOpenIcon />
        </Tooltip>
      </IconButton>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps)(GeneralReplyActionsButton);
