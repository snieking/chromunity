import React from 'react';
import {Link} from 'react-router-dom'

import {getUser} from '../../util/user-util';

import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {ExitToApp, Face, Gavel, HowToVote, LocationCity, People, Report, RssFeed, Settings} from "@material-ui/icons";

import NotificationsButton from "../buttons/NotificationsButton";
import {Button, ListItemIcon, Menu, MenuItem, Tooltip, Typography} from '@material-ui/core';
import {COLOR_SOFT_PINK} from "../../theme";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        navToolbar: {
            backgroundColor: "#100d14"
        },
        navIcon: {
            color: COLOR_SOFT_PINK
        },
        grow: {
            flexGrow: 1
        },
        menuButton: {
            marginRight: theme.spacing(1),
        },
        title: {
            display: 'none',
            [theme.breakpoints.up('sm')]: {
                display: 'block',
            },
            color: "#000000"
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 7),
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: 200,
            },
        },
        sectionDesktop: {
            display: 'flex'
        }
    }),
);

const HeaderNav: React.FunctionComponent = (props: any) => {
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
                        <NotificationsButton username={user.name}/>
                    </Link>

                    <Button aria-controls="profile-menu" aria-haspopup="true" onClick={handleProfileClick}>
                        <Tooltip title="Profile">
                            <AccountCircle className={classes.navIcon}/>
                        </Tooltip>
                    </Button>

                    <Menu
                        id="profile-menu"
                        anchorEl={profileAnchorEl}
                        keepMounted
                        open={Boolean(profileAnchorEl)}
                        onClose={handleProfileClose}
                    >
                        <Link style={{width: "100%"}} to={"/u/" + user.name}>
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <AccountCircle/>
                                </ListItemIcon>
                                <Typography>Profile</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link style={{width: "100%"}} to={"/user/settings"}>
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <Settings/>
                                </ListItemIcon>
                                <Typography>Settings</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link style={{width: "100%"}} to="/user/logout">
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <ExitToApp/>
                                </ListItemIcon>
                                <Typography>Logout</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                </div>
            )
        } else {
            return (
                <Tooltip title="account">
                    <Link to="/user/login">
                        <IconButton>
                            <AccountCircle/>
                        </IconButton>
                    </Link>
                </Tooltip>
            )
        }
    }

    function renderFavoriteWalls() {
        if (user != null) {
            return (
                <div>
                    <Link to="/channels">
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            aria-label="Open drawer"
                        >
                            <Tooltip title="Channels">
                                <RssFeed className={classes.navIcon}/>
                            </Tooltip>
                        </IconButton>
                    </Link>

                    <Link to="/followings">
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            aria-label="Open drawer"
                        >
                            <Tooltip title="Users">
                                <People className={classes.navIcon}/>
                            </Tooltip>
                        </IconButton>
                    </Link>
                </div>
            )
        }
    }

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar className={classes.navToolbar}>
                    <Link to="/">
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            aria-label="Open drawer"
                        >
                            <Tooltip title="Home">
                                <Home className={classes.navIcon}/>
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
                            <LocationCity className={classes.navIcon}/>
                        </Tooltip>
                    </IconButton>

                    <Menu
                        id="gov-menu"
                        anchorEl={govAnchorEl}
                        keepMounted
                        open={Boolean(govAnchorEl)}
                        onClose={handleGovClose}
                    >
                        <Link style={{width: "100%"}} to="/gov/representatives">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Face className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Representatives</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link style={{width: "100%"}} to="/gov/election">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <HowToVote className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Election</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link style={{width: "100%"}} to="/gov/log">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Gavel className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Log</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link style={{width: "100%"}} to="/gov/reports">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Report className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Reports</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                    <div className={classes.grow}/>
                    <div className={classes.sectionDesktop}>
                        {profileSpecificNavigation()}
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    )
};

export default HeaderNav;