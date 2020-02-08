import React from "react";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@material-ui/core";
import Badge from "@material-ui/core/Badge/Badge";
import { AccountCircle, Chat, ExitToApp, Settings } from "@material-ui/icons";
import NotificationsButton from "../../buttons/NotificationsButton";
import ThemeSwitcher from "../ThemeSwitcher";
import { ChromunityUser } from "../../../types";

interface Props {
  user: ChromunityUser;
  classes: Record<string, string>;
  unreadChats: number;
}

const ProfileNavigation: React.FunctionComponent<Props> = (props: Props) => {
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);


  function handleProfileClick(event: React.MouseEvent<HTMLButtonElement>) {
    setProfileAnchorEl(event.currentTarget);
  }

  function handleProfileClose() {
    setProfileAnchorEl(null);
  }

  if (props.user != null) {
    return (
      <div className={props.classes.profileMenu}>
        <Link to="/chat">
          <IconButton className={props.classes.rightMenuButton}>
            <Tooltip title="Chat">
              <Badge badgeContent={props.unreadChats} color="secondary">
                <Chat />
              </Badge>
            </Tooltip>
          </IconButton>
        </Link>
        <Link to={"/notifications/" + props.user.name}>
          <div className={props.classes.rightMenuButton}>
            <NotificationsButton username={props.user.name} />
          </div>
        </Link>

        <IconButton
          className={props.classes.rightMenuButton}
          aria-controls="profile-menu"
          aria-haspopup="true"
          onClick={handleProfileClick}
        >
          <Tooltip title="Profile">
            <AccountCircle />
          </Tooltip>
        </IconButton>

        <Menu
          id="profile-menu"
          anchorEl={profileAnchorEl}
          keepMounted
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
        >
          <Link style={{ width: "100%" }} to={"/u/" + props.user.name}>
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <Typography>Profile</Typography>
            </MenuItem>
          </Link>
          <br />
          <Link style={{ width: "100%" }} to={"/user/settings"}>
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <Typography>Settings</Typography>
            </MenuItem>
          </Link>
          <br />
          <ThemeSwitcher />
          <Link style={{ width: "100%" }} to="/user/logout">
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <Typography>Logout</Typography>
            </MenuItem>
          </Link>
        </Menu>
      </div>
    );
  } else {
    return (
      <div style={{ float: "right" }}>
        <Tooltip title="account">
          <Link to="/user/login">
            <IconButton>
              <AccountCircle className={props.classes.navIcon} />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    );
  }
};

export default ProfileNavigation;