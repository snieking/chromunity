import React from 'react';
import {Link} from 'react-router-dom'

import {getUser} from '../../../util/user-util';

import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {ExitToApp, Gavel, LocationCity, Poll, TrendingUp, Settings} from "@material-ui/icons";

import './HeaderNav.css';
import {NotificationsButton} from "../../buttons/NotificationsButton";

export interface HeaderNavProps {
    toggleSidebarFunction: Function
}

export default function HeaderNav(props: HeaderNavProps) {
    const classes = useStyles();
    const user = getUser();

    function profileSpecificNavigation() {
        if (user.name != null) {
            return (
                <div>
                    <Link to={"/notifications/" + user.name}>
                        <NotificationsButton username={user.name}/>
                    </Link>
                    <Link to={"/user/settings"}>
                        <IconButton>
                            <Settings className="nav-button"/>
                        </IconButton>
                    </Link>
                    <Link to={"/u/" + user.name}>{profileIcon()}</Link>
                    <Link to="/user/logout">
                        <IconButton>
                            <ExitToApp className="nav-button"/>
                        </IconButton>
                    </Link>
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
                    <AccountCircle className="nav-button"/>
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
                            <Home className="nav-button"/>
                        </IconButton>
                    </Link>
                    <IconButton onClick={() => props.toggleSidebarFunction()}>
                        <TrendingUp className="nav-button"/>
                    </IconButton>
                    <Link to="/gov/representatives">
                        <IconButton>
                            <LocationCity className="nav-button"/>
                        </IconButton>
                    </Link>
                    <Link to="/gov/election">
                        <IconButton>
                            <Poll className="nav-button"/>
                        </IconButton>
                    </Link>
                    <Link to="/gov/log">
                        <IconButton>
                            <Gavel className="nav-button"/>
                        </IconButton>
                    </Link>
                    <div className={classes.grow}/>
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
