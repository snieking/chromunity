import React, { FormEvent } from "react";

import './Buttons.css';

import { Dialog, Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogTitle from "@material-ui/core/DialogTitle";
import { createThread } from "../../blockchain/MessageService";
import { getUser } from "../../util/user-util";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { CustomSnackbarContentWrapper } from "../utils/CustomSnackbar";


export interface NewThreadButtonProps {
    updateFunction: Function;
}

export interface NewThreadButtonState {
    dialogOpen: boolean;
    threadMessage: string;
    snackbarOpen: boolean;
}

export class NewThreadButton extends React.Component<NewThreadButtonProps, NewThreadButtonState> {

    constructor(props: NewThreadButtonProps) {
        super(props);

        this.state = {
            threadMessage: "",
            dialogOpen: false,
            snackbarOpen: false
        };

        this.toggleNewThreadDialog = this.toggleNewThreadDialog.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewThread = this.createNewThread.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    toggleNewThreadDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ threadMessage: event.target.value });
    }

    createNewThread(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const threadMessage = this.state.threadMessage;
        this.setState({ threadMessage: "", snackbarOpen: true });

        createThread(getUser(), threadMessage || "").then(() => this.props.updateFunction());
        this.toggleNewThreadDialog();
    }

    createThreadButton() {
        if (getUser().name != null) {
            return (
                <div className="bottom-right-corner rounded-pink">
                    <IconButton aria-label="New thread"
                        onClick={() => this.toggleNewThreadDialog()}
                        style={{ backgroundColor: "#FFAFC1", marginRight: "5px", marginBottom: "5px" }}
                    >
                        <Forum fontSize="large" className="new-thread-button" />
                    </IconButton>
                </div>
            )
        }
    }

    newThreadDialog() {
        return (
            <div>
                <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title"
                    fullWidth={true} maxWidth={"sm"}>
                    <form onSubmit={this.createNewThread}>
                        <DialogTitle id="form-dialog-title">What's on your mind?</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="message"
                                multiline
                                type="text"
                                fullWidth
                                onChange={this.handleDialogMessageChange}
                                value={this.state.threadMessage}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.toggleNewThreadDialog()} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Send
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.snackbarOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="success"
                        message={"Thread created"}
                    />
                </Snackbar>
            </div>
        )
    }

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ snackbarOpen: false });
    }

    render() {
        return (
            <div>
                {this.createThreadButton()}
                {this.newThreadDialog()}
            </div>
        )
    }
}
