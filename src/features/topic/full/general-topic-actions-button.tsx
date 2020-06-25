import React, { useState } from 'react';
import { IconButton, Tooltip, Menu } from '@material-ui/core';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import SubscribeButton from './subscribe-button';
import ReportButton from './report-button';
import { Topic } from '../../../types';
import SocialShareButton from '../social-share-button';

interface Props {
  topic: Topic;
}

const GeneralTopicActionsButton: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu id="topic-actions" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <SubscribeButton topicId={props.topic.id} onConfirm={handleClose} />
        <ReportButton topicId={props.topic.id} onConfirm={handleClose} />
        <SocialShareButton text={props.topic.title} onClick={handleClose} />
      </Menu>
      <IconButton onClick={handleClick}>
        <Tooltip title="Actions">
          <MenuOpenIcon />
        </Tooltip>
      </IconButton>
    </>
  );
};

export default GeneralTopicActionsButton;
