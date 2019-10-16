import React from "react";
import { Link } from "react-router-dom";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Home from "@material-ui/icons/Home";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { ExitToApp, Face, Gavel, HowToVote, LocationCity, People, Report, RssFeed, Settings } from "@material-ui/icons";
import {Menu as MenuIcon} from "@material-ui/icons/";

import NotificationsButton from "../buttons/NotificationsButton";
import { Button, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@material-ui/core";
import { getUser } from "../../util/user-util";
import ThemeSwitcher from "./ThemeSwitcher";
import config from "../../config";
import { ApplicationState } from "../../redux/Store";
import { checkActiveElection, loadRepresentatives, loadUnhandledReports } from "../../redux/actions/GovernmentActions";
import { connect } from "react-redux";
import Badge from "@material-ui/core/Badge";

interface Props {
  representatives: string[];
  unhandledReports: number;
  activeElection: boolean;
  loadRepresentatives: typeof loadRepresentatives;
  loadUnhandledReports: typeof loadUnhandledReports;
  checkActiveElection: typeof checkActiveElection;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testInfo: {
      textAlign: "center"
    },
    desktopWallNav: {
      display: "inherit",
      [theme.breakpoints.down("sm")]: {
        display: "none"
      }
    },
    mobileWallNav: {
      display: "inherit",
      [theme.breakpoints.up("md")]: {
        display: "none"
      }
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

const HeaderNav: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const user = getUser();
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);
  const [govAnchorEl, setGovAnchorEl] = React.useState<null | HTMLElement>(null);
  const [wallAnchorEl, setWallAnchorEl] = React.useState<null | HTMLElement>(null);

  props.loadRepresentatives();
  props.checkActiveElection();

  if (isRepresentative()) {
    props.loadUnhandledReports();
  }

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

  function handleWallMenuClick(event: React.MouseEvent<HTMLButtonElement>) {
    setWallAnchorEl(event.currentTarget);
  }

  function handleWallMenuClose() {
    setWallAnchorEl(null);
  }

  function isRepresentative() {
    return user != null && props.representatives.includes(user.name.toLocaleLowerCase());
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
            This is a development version. Data might be reset from time to time. Please feel free to test, submit bug
            reports as a topic and please provide console logs.
          </Typography>
        </AppBar>
      );
    }
  }

  function renderGovernmentIcon() {
    if (isRepresentative() && props.unhandledReports > 0) {
      return (
        <Badge badgeContent={props.unhandledReports} color="secondary">
          <LocationCity className={classes.navIcon} />
        </Badge>
      );
    } else {
      return (
        <Badge invisible={!props.activeElection} color="secondary">
          <LocationCity className={classes.navIcon} />
        </Badge>
      );
    }
  }

  const desktopWallNav = () => (
    <div className={classes.desktopWallNav}>
      <Link to="/">
        <IconButton edge="start" className={classes.menuButton} aria-label="Open drawer">
          <Tooltip title="Home">
            <Home className={classes.navIcon} />
          </Tooltip>
        </IconButton>
      </Link>
      {renderFavoriteWalls()}
      <IconButton className={classes.menuButton} onClick={handleGovClick} aria-controls="gov-menu" aria-haspopup="true">
        <Tooltip title="Governing">{renderGovernmentIcon()}</Tooltip>
      </IconButton>
    </div>
  );

  const mobileWallNav = () => (
    <div className={classes.mobileWallNav}>
      <IconButton className={classes.menuButton} onClick={handleWallMenuClick} aria-controls="wall-menu" aria-haspopup="true">
        <MenuIcon />
      </IconButton>
      <Menu
        id="wall-menu"
        anchorEl={wallAnchorEl}
        keepMounted
        open={Boolean(wallAnchorEl)}
        onClose={handleWallMenuClose}
      >
        <Link style={{ width: "100%" }} to="/channels">
          <MenuItem onClick={handleWallMenuClose}>
            <ListItemIcon>
              <RssFeed className="menu-item-button" />
            </ListItemIcon>
            <Typography className="menu-item-text">Channels</Typography>
          </MenuItem>
        </Link>
        <br />
        <Link style={{ width: "100%" }} to="/followings">
          <MenuItem onClick={handleWallMenuClose}>
            <ListItemIcon>
              <People className="menu-item-button" />
            </ListItemIcon>
            <Typography className="menu-item-text">Followings</Typography>
          </MenuItem>
        </Link>
      </Menu>
    </div>
  );

  return (
    <div className={classes.grow}>
      {renderTestInfoBar()}
      <AppBar position="static">
        <Toolbar>
          {desktopWallNav()}
          {mobileWallNav()}
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
                  <Badge variant="dot" invisible={!props.activeElection} color="secondary">
                    <HowToVote className="menu-item-button" />
                  </Badge>
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
                  <Badge badgeContent={isRepresentative() ? props.unhandledReports : 0} color="secondary">
                    <Report className="menu-item-button" />
                  </Badge>
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

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
    unhandledReports: store.government.unhandledReports,
    loadUnhandledReports: store.government.unhandledReports,
    activeElection: store.government.activeElection
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    loadRepresentatives: () => dispatch(loadRepresentatives()),
    loadUnhandledReports: () => dispatch(loadUnhandledReports()),
    checkActiveElection: () => dispatch(checkActiveElection())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderNav);
