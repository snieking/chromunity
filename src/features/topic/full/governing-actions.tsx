import React, { useState } from 'react';
import { connect } from 'react-redux';
import { IconButton, Tooltip, Menu } from '@material-ui/core';
import { LocationCity } from '@material-ui/icons';
import { ChromunityUser } from '../../../types';
import { toLowerCase } from '../../../shared/util/util';
import ApplicationState from '../../../core/application-state';
import PinButton from './pin-button';
import DeleteButton from './delete-button';
import { isRepresentative } from '../../../shared/util/user-util';

interface Props {
  topicId: string;
  representatives: string[];
  rateLimited: boolean;
  user: ChromunityUser;
}

const GoverningActions: React.FunctionComponent<Props> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    isRepresentative(props.user, props.representatives) && (
      <>
        <Menu id="gov-actions" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
          <PinButton topicId={props.topicId} handleClose={handleClose} />
          <DeleteButton topicId={props.topicId} handleClose={handleClose} />
        </Menu>
        <IconButton onClick={handleClick}>
          <Tooltip title="Governing">
            <LocationCity />
          </Tooltip>
        </IconButton>
      </>
    )
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited,
  };
};

export default connect(mapStateToProps)(GoverningActions);
