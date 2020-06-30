import React from 'react';
import { Link } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';
import { Home, People, RssFeed } from '@material-ui/icons';
import { ChromunityUser } from '../../types';

interface Props {
  user: ChromunityUser;
  classes: Record<string, string>;
  handleGovClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  renderGovernmentIcon: () => JSX.Element;
}

const DesktopWallNavigation: React.FunctionComponent<Props> = (props: Props) => {
  function renderFavoriteWalls(user: ChromunityUser): JSX.Element {
    return (
      user && (
        <div>
          <Link to="/channels">
            <IconButton edge="start" className={props.classes.leftMenuButton} aria-label="Open drawer">
              <Tooltip title="Channels">
                <RssFeed className={props.classes.navIcon} />
              </Tooltip>
            </IconButton>
          </Link>

          <Link to="/followings">
            <IconButton edge="start" className={props.classes.leftMenuButton} aria-label="Open drawer">
              <Tooltip title="Followed Users">
                <People className={props.classes.navIcon} />
              </Tooltip>
            </IconButton>
          </Link>
        </div>
      )
    );
  }

  return (
    <div className={props.classes.desktopWallNav}>
      <Link to="/">
        <IconButton edge="start" className={props.classes.leftMenuButton} aria-label="Open drawer">
          <Tooltip title="All">
            <Home />
          </Tooltip>
        </IconButton>
      </Link>
      {renderFavoriteWalls(props.user)}
      <IconButton
        className={props.classes.leftMenuButton}
        onClick={props.handleGovClick}
        aria-controls="gov-menu"
        aria-haspopup="true"
      >
        <Tooltip title="Governing">{props.renderGovernmentIcon()}</Tooltip>
      </IconButton>
    </div>
  );
};

export default DesktopWallNavigation;
