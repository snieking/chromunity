import React, { FormEvent } from "react";

import './Buttons.css';

import { Dialog } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { ReplyAll } from "@material-ui/icons";
import { createTopicReply } from "../../blockchain/TopicService";
import { getUser } from "../../util/user-util";


export interface ReplyTopicButtonProps {
    submitFunction: Function;
    topicId: string;
    topicAuthor: string;
}

export interface ReplyTopicButtonState {
    dialogOpen: boolean;
    topicMessage: string;
}

export class ReplyTopicButton extends React.Component<ReplyTopicButtonProps, ReplyTopicButtonState> {

    constructor(props: ReplyTopicButtonProps) {
        super(props);

        this.state = {
            topicMessage: "",
            dialogOpen: false
        };

        this.toggleReplyTopicDialog = this.toggleReplyTopicDialog.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createTopicReply = this.createTopicReply.bind(this);
    }

    toggleReplyTopicDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicMessage: event.target.value });
    }

    createTopicReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const topicMessage = this.state.topicMessage;
        this.setState({ topicMessage: "" });

        createTopicReply(getUser(), this.props.topicId, topicMessage).then(() => this.props.submitFunction());
        this.toggleReplyTopicDialog();
    }

    createTopicButton() {
        return (
            <div className="bottom-right-corner rounded-pink">
                <IconButton aria-label="Reply to topic"
                    onClick={() => this.toggleReplyTopicDialog()}
                    style={{ backgroundColor: "#FFAFC1", marginRight: "5px", marginBottom: "5px", height: "64px", width: "64px" }}
                >
                    <ReplyAll fontSize="large" className="new-topic-button" />
                </IconButton>
            </div>
        )
    }

    newTopicDialog() {
        return (
            <div>
                <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title"
                    fullWidth={true} maxWidth={"sm"}>
                    <form onSubmit={this.createTopicReply}>
                        <DialogContent>
                            <br/>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="message"
                                multiline
                                label="Reply"
                                type="text"
                                rows="3"
                                variant="outlined"
                                fullWidth
                                onChange={this.handleDialogMessageChange}
                                value={this.state.topicMessage}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.toggleReplyTopicDialog()} color="secondary" variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="outlined">
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
                {this.createTopicButton()}
                {this.newTopicDialog()}
            </div>
        )
    }
}
