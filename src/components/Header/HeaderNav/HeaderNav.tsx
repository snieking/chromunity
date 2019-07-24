import React from 'react';
import { Link } from 'react-router-dom'

import { getUser } from '../../../util/user-util';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { ExitToApp, Gavel, LocationCity, Face, HowToVote, Bookmarks, Settings, People } from "@material-ui/icons";

import './HeaderNav.css';
import { NotificationsButton } from "../../buttons/NotificationsButton";
import { Button, MenuItem, Menu, ListItemIcon, Typography, Tooltip } from '@material-ui/core';

export interface HeaderNavProps {

}

export default function HeaderNav(props: HeaderNavProps) {
    const classes = useStyles();
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
        if (user.name != null) {
            return (
                <div>
                    <Tooltip title="Notifications">
                        <Link to={"/notifications/" + user.name}>
                            <NotificationsButton username={user.name} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Profile">
                        <Button aria-controls="profile-menu" aria-haspopup="true" onClick={handleProfileClick}>
                            <AccountCircle className="nav-button" />
                        </Button>
                    </Tooltip>
                    <Menu
                        id="profile-menu"
                        anchorEl={profileAnchorEl}
                        keepMounted
                        open={Boolean(profileAnchorEl)}
                        onClose={handleProfileClose}
                    >
                        <Link to={"/u/" + user.name}>
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <AccountCircle className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Profile</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to={"/user/settings"}>
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <Settings className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Settings</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to="/user/logout">
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <ExitToApp className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Logout</Typography>
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
                            <AccountCircle className="nav-button" />
                        </IconButton>
                    </Link>
                </Tooltip>
            )
        }
    }

    function renderFavoriteWalls() {
        if (user.name != null) {
            return (
                <div>
                    <Tooltip title="Tags">
                        <Link to="/tags">
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                aria-label="Open drawer"
                            >
                                <Bookmarks className="nav-button" />
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Followings">
                        <Link to="/followings">
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                aria-label="Open drawer"
                            >
                                <People className="nav-button" />
                            </IconButton>
                        </Link>
                    </Tooltip>
                </div >
            )
        }
    }

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar className="nav-toolbar">
                    <Tooltip title="Home">
                        <Link to="/">
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                aria-label="Open drawer"
                            >
                                <Home className="nav-button" />
                            </IconButton>
                        </Link>
                    </Tooltip>
                    {renderFavoriteWalls()}
                    <Tooltip title="Governing">
                        <Button aria-controls="gov-menu" aria-haspopup="true" onClick={handleGovClick}>
                            <LocationCity className="nav-button" />
                        </Button>
                    </Tooltip>
                    <Menu
                        id="gov-menu"
                        anchorEl={govAnchorEl}
                        keepMounted
                        open={Boolean(govAnchorEl)}
                        onClose={handleGovClose}
                    >
                        <Link to="/gov/representatives">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Face className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Representatives</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to="/gov/election">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <HowToVote className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Election</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to="/gov/log">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Gavel className="menu-item-button" />
                                </ListItemIcon>
                                <Typography className="menu-item-text">Log</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                    <div className={classes.grow} />
                    <div className={classes.sectionDesktop}>
                        {profileSpecificNavigation()}
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    )
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        grow: {
            flexGrow: 1
        },
        menuButton: {
            marginRight: theme.spacing(2),
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
