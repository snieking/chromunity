import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Home, Menu as MenuIcon, People, RssFeed } from '@material-ui/icons';
import { ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

interface Props {
  classes: Record<string, string>;
  handleGovClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  renderGovernmentIcon: () => JSX.Element;
}

const MobileWallNavigation: React.FunctionComponent<Props> = (props: Props) => {
  const [wallAnchorEl, setWallAnchorEl] = React.useState<null | HTMLElement>(null);

  function handleWallMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
    setWallAnchorEl(event.currentTarget);
  }

  function handleWallMenuClose() {
    setWallAnchorEl(null);
  }

  return (
    <div className={props.classes.mobileWallNav}>
      <IconButton
        className={props.classes.leftMenuButton}
        onClick={handleWallMenuClick}
        aria-controls="wall-menu"
        aria-haspopup="true"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="wall-menu"
        anchorEl={wallAnchorEl}
        keepMounted
        open={Boolean(wallAnchorEl)}
        onClose={handleWallMenuClose}
      >
        <Link style={{ width: '100%' }} to="/">
          <MenuItem onClick={handleWallMenuClose}>
            <ListItemIcon>
              <Home className="menu-item-button" />
            </ListItemIcon>
            <Typography className="menu-item-text">All</Typography>
          </MenuItem>
        </Link>
        <Link style={{ width: '100%' }} to="/channels">
          <MenuItem onClick={handleWallMenuClose}>
            <ListItemIcon>
              <RssFeed className="menu-item-button" />
            </ListItemIcon>
            <Typography className="menu-item-text">Channels</Typography>
          </MenuItem>
        </Link>
        <br />
        <Link style={{ width: '100%' }} to="/followings">
          <MenuItem onClick={handleWallMenuClose}>
            <ListItemIcon>
              <People className="menu-item-button" />
            </ListItemIcon>
            <Typography className="menu-item-text">Followed Users</Typography>
          </MenuItem>
        </Link>
      </Menu>
      <IconButton
        className={props.classes.leftMenuButton}
        onClick={props.handleGovClick}
        aria-controls="gov-menu"
        aria-haspopup="true"
      >
        <Tooltip title="Town hall">{props.renderGovernmentIcon()}</Tooltip>
      </IconButton>
    </div>
  );
};

export default MobileWallNavigation;
