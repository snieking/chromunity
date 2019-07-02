import React from 'react';
import {Link} from 'react-router-dom'

import {getUser} from '../../../util/user-util';

import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {ExitToApp} from "@material-ui/icons";

import './HeaderNav.css';

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

export default function HeaderNav() {
    const classes = useStyles();
    const user = getUser();

    function profileSpecificNavigation() {
        if (user.name != null) {
            return (
                <div>
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
                    <div className={classes.grow}/>
                    <div className={classes.sectionDesktop}>
                        {profileSpecificNavigation()}
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}
