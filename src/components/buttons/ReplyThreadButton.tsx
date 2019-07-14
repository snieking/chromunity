import React, { FormEvent } from "react";

import './Buttons.css';

import { Dialog } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogTitle from "@material-ui/core/DialogTitle";
import { createSubThread } from "../../blockchain/MessageService";
import IconButton from "@material-ui/core/IconButton";
import { ReplyAll } from "@material-ui/icons";
import { getUser } from "../../util/user-util";


export interface ReplyThreadButtonProps {
    updateFunction: Function,
    rootThreadId: string,
    rootThreadAuthor: string
}

export interface ReplyThreadButtonState {
    dialogOpen: boolean,
    threadMessage: string
}

export class ReplyThreadButton extends React.Component<ReplyThreadButtonProps, ReplyThreadButtonState> {

    constructor(props: ReplyThreadButtonProps) {
        super(props);

        this.state = {
            threadMessage: "",
            dialogOpen: false
        };

        this.toggleReplyThreadDialog = this.toggleReplyThreadDialog.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createSubThread = this.createSubThread.bind(this);
    }

    toggleReplyThreadDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.persist();
        this.setState({ threadMessage: event.target.value });
    }

    createSubThread(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const threadMessage = this.state.threadMessage;
        this.setState({ threadMessage: "" });

        createSubThread(getUser(), this.props.rootThreadId, this.props.rootThreadAuthor, threadMessage || "")
            .then(() => this.props.updateFunction());
        this.toggleReplyThreadDialog();
    }

    createThreadButton() {
        return (
            <div className="bottom-right-corner rounded-pink">
                <IconButton aria-label="Reply to thread"
                    onClick={() => this.toggleReplyThreadDialog()}
                    style={{ backgroundColor: "#FFAFC1", marginRight: "5px", marginBottom: "5px" }}
                >
                    <ReplyAll fontSize="large" className="new-thread-button" />
                </IconButton>
            </div>
        )
    }

    newThreadDialog() {
        return (
            <div>
                <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title"
                    fullWidth={true} maxWidth={"sm"}>
                    <form onSubmit={this.createSubThread}>
                        <DialogTitle id="form-dialog-title">Reply</DialogTitle>
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
                            <Button onClick={() => this.toggleReplyThreadDialog()} color="primary">
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

    render() {
        return (
            <div>
                {this.createThreadButton()}
                {this.newThreadDialog()}
            </div>
        )
    }
}
