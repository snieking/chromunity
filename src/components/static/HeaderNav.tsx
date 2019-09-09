import React from "react";
import { Link } from "react-router-dom";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Home from "@material-ui/icons/Home";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { ExitToApp, Face, Gavel, HowToVote, LocationCity, People, Report, RssFeed, Settings } from "@material-ui/icons";

import NotificationsButton from "../buttons/NotificationsButton";
import { Button, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@material-ui/core";
import { getUser } from "../../util/user-util";
import ThemeSwitcher from "./ThemeSwitcher";
import config from "../../config";
import { COLOR_OFF_WHITE } from "../../theme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testInfo: {
      textAlign: "center"
    },
    navIcon: {
      color: theme.palette.primary.main
    },
    grow: {
      flexGrow: 1
    },
    menuButton: {
      [theme.breakpoints.up("sm")]: {
        marginRight: theme.spacing(1)
      },
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(2)
      },
      [theme.breakpoints.up("lg")]: {
        marginRight: theme.spacing(3)
      }
    },
    inputRoot: {
      color: "inherit"
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: 200
      }
    },
    sectionDesktop: {
      display: "flex"
    }
  })
);

const HeaderNav: React.FunctionComponent = (props: unknown) => {
  const classes = useStyles(props);
  const user = getUser();
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);
  const [govAnchorEl, setGovAnchorEl] = React.useState<null | HTMLElement>(null);

  function handleProfileClick(event: React.MouseEvent<HTMLButtonElement>) {
    setProfileAnchorEl(event.currentTarget);
  }

  function handleProfileClose() {
    setProfileAnchorEl(null);
  }

  function handleGovClick(event: React.MouseEvent<HTMLButtonElement>) {
    setGovAnchorEl(event.currentTarget);
  }

  function handleGovClose() {
    setGovAnchorEl(null);
  }

  function profileSpecificNavigation() {
    if (user != null) {
      return (
        <div>
          <Link to={"/notifications/" + user.name}>
            <NotificationsButton username={user.name} />
          </Link>

          <Button aria-controls="profile-menu" aria-haspopup="true" onClick={handleProfileClick}>
            <Tooltip title="Profile">
              <AccountCircle className={classes.navIcon} />
            </Tooltip>
          </Button>

          <Menu
            id="profile-menu"
            anchorEl={profileAnchorEl}
            keepMounted
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
          >
            <Link style={{ width: "100%" }} to={"/u/" + user.name}>
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
        <Tooltip title="account">
          <Link to="/user/login">
            <IconButton>
              <AccountCircle className={classes.navIcon} />
            </IconButton>
          </Link>
        </Tooltip>
      );
    }
  }

  function renderFavoriteWalls() {
    if (user != null) {
      return (
        <div>
          <Link to="/channels">
            <IconButton edge="start" className={classes.menuButton} aria-label="Open drawer">
              <Tooltip title="Channels">
                <RssFeed className={classes.navIcon} />
              </Tooltip>
            </IconButton>
          </Link>

          <Link to="/followings">
            <IconButton edge="start" className={classes.menuButton} aria-label="Open drawer">
              <Tooltip title="Users">
                <People className={classes.navIcon} />
              </Tooltip>
            </IconButton>
          </Link>
        </div>
      );
    }
  }

  function renderTestInfoBar() {
    if (config.testMode) {
      return (
        <AppBar position="static" color="secondary">
          <Typography variant="body2" component="p" className={classes.testInfo}>
            This is a development site. Data might be reset from time to time.
          </Typography>
        </AppBar>
      );
    }
  }

  return (
    <div className={classes.grow}>
      {renderTestInfoBar()}
      <AppBar position="static">
        <Toolbar>
          <Link to="/">
            <IconButton edge="start" className={classes.menuButton} aria-label="Open drawer">
              <Tooltip title="Home">
                <Home className={classes.navIcon} />
              </Tooltip>
            </IconButton>
          </Link>
          {renderFavoriteWalls()}

          <IconButton
            className={classes.menuButton}
            onClick={handleGovClick}
            aria-controls="gov-menu"
            aria-haspopup="true"
          >
            <Tooltip title="Governing">
              <LocationCity className={classes.navIcon} />
            </Tooltip>
          </IconButton>

          <Menu id="gov-menu" anchorEl={govAnchorEl} keepMounted open={Boolean(govAnchorEl)} onClose={handleGovClose}>
            <Link style={{ width: "100%" }} to="/gov/representatives">
              <MenuItem onClick={handleGovClose}>
                <ListItemIcon>
                  <Face className="menu-item-button" />
                </ListItemIcon>
                <Typography className="menu-item-text">Representatives</Typography>
              </MenuItem>
            </Link>
            <br />
            <Link style={{ width: "100%" }} to="/gov/election">
              <MenuItem onClick={handleGovClose}>
                <ListItemIcon>
                  <HowToVote className="menu-item-button" />
                </ListItemIcon>
                <Typography className="menu-item-text">Election</Typography>
              </MenuItem>
            </Link>
            <br />
            <Link style={{ width: "100%" }} to="/gov/log">
              <MenuItem onClick={handleGovClose}>
                <ListItemIcon>
                  <Gavel className="menu-item-button" />
                </ListItemIcon>
                <Typography className="menu-item-text">Log</Typography>
              </MenuItem>
            </Link>
            <br />
            <Link style={{ width: "100%" }} to="/gov/reports">
              <MenuItem onClick={handleGovClose}>
                <ListItemIcon>
                  <Report className="menu-item-button" />
                </ListItemIcon>
                <Typography className="menu-item-text">Reports</Typography>
              </MenuItem>
            </Link>
          </Menu>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>{profileSpecificNavigation()}</div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HeaderNav;
