import React from 'react';
import { Link } from 'react-router-dom'

import { getUser } from '../../../util/user-util';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { ExitToApp, Gavel, LocationCity, Poll, TrendingUp, Settings, Face } from "@material-ui/icons";

import './HeaderNav.css';
import { NotificationsButton } from "../../buttons/NotificationsButton";
import { Button, MenuItem, Menu, ListItemIcon, Typography } from '@material-ui/core';

export interface HeaderNavProps {
    toggleSidebarFunction: Function
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
                    <Link to={"/notifications/" + user.name}>
                        <NotificationsButton username={user.name} />
                    </Link>
                    <Button aria-controls="profile-menu" aria-haspopup="true" onClick={handleProfileClick}>
                        {profileIcon()}
                    </Button>
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
                                    <AccountCircle className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Profile</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link to={"/user/settings"}>
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <Settings className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Settings</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to="/user/logout">
                            <MenuItem onClick={handleProfileClose}>
                                <ListItemIcon>
                                    <ExitToApp className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Logout</Typography>
                            </MenuItem>
                        </Link>
                    </Menu>
                </div>
            )
        } else {
            return (<Link to="/user/login">{profileIcon()}</Link>)
        }
    }

    function profileIcon() {
        return (
            <div>
                <IconButton>
                    <AccountCircle className="nav-button" />
                </IconButton>
            </div>
        )
    }

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar className="nav-toolbar">
                    <Link to="/">
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            aria-label="Open drawer"
                        >
                            <Home className="nav-button" />
                        </IconButton>
                    </Link>
                    <IconButton onClick={() => props.toggleSidebarFunction()}>
                        <TrendingUp className="nav-button" />
                    </IconButton>

                    <Button aria-controls="gov-menu" aria-haspopup="true" onClick={handleGovClick}>
                        <LocationCity className="nav-button" />
                    </Button>
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
                                    <Face className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Representatives</Typography>
                            </MenuItem>
                        </Link>
                        <br/>
                        <Link to="/gov/election">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Poll className="menu-item-button"/>
                                </ListItemIcon>
                                <Typography className="menu-item-text">Election</Typography>
                            </MenuItem>
                        </Link>
                        <br />
                        <Link to="/gov/log">
                            <MenuItem onClick={handleGovClose}>
                                <ListItemIcon>
                                    <Gavel className="menu-item-button"/>
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
