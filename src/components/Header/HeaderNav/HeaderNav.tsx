import React, {FormEvent} from 'react';
import {Link} from 'react-router-dom'

import {getUser} from '../../../util/user-util';

import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Home from '@material-ui/icons/Home';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MessageIcon from '@material-ui/icons/Message';
import {Dialog} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {ExitToApp} from "@material-ui/icons";

import './HeaderNav.css';
import {createThread} from "../../../blockchain/MessageService";

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
    const [dialogAnchorEl, setDialogAnchorEl] = React.useState<null | HTMLElement>(null);
    const [threadMessage, setThreadMessage] = React.useState<null | string>("");

    const isDialogOpen = Boolean(dialogAnchorEl);

    function handleNewThreadClickOpen(event: React.MouseEvent<HTMLElement>) {
        setDialogAnchorEl(event.currentTarget);
    }

    function handleNewThreadDialogClose() {
        setDialogAnchorEl(null);
    }

    function handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.persist();
        setThreadMessage(event.target.value);
    }

    function createNewThread(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Creating new thread with message", threadMessage);
        createThread(getUser(), threadMessage || "");
        setThreadMessage("");
        handleNewThreadDialogClose();
        window.location.reload();
    }

    function createThreadButton() {
        return (
            <div>
                <IconButton aria-label="New thread" onClick={handleNewThreadClickOpen}>
                    <MessageIcon className="nav-button"/>
                </IconButton>
            </div>
        )
    }

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

    function newThreadDialog() {
        return (
            <div>
                <Dialog open={isDialogOpen}
                        aria-labelledby="form-dialog-title">
                    <form onSubmit={createNewThread}>
                        <DialogTitle id="form-dialog-title">What's on your mind?</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="message"
                                multiline
                                type="text"
                                fullWidth
                                onChange={handleDialogMessageChange}
                                value={threadMessage}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleNewThreadDialogClose} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Send
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
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
                        {createThreadButton()}
                        {newThreadDialog()}
                        {profileSpecificNavigation()}
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}
