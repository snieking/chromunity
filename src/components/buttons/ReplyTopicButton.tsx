import React, {FormEvent} from "react";

import './Buttons.css';

import {Dialog, Snackbar} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import {ReplyAll} from "@material-ui/icons";
import {createTopicReply} from "../../blockchain/TopicService";
import {getCachedUserMeta, getUser} from "../../util/user-util";
import {CustomSnackbarContentWrapper} from "../utils/CustomSnackbar";
import {UserMeta} from "../../types";


export interface ReplyTopicButtonProps {
    submitFunction: Function;
    topicId: string;
    topicAuthor: string;
}

export interface ReplyTopicButtonState {
    dialogOpen: boolean;
    topicMessage: string;
    replyStatusSuccessOpen: boolean;
    replyStatusErrorOpen: boolean;
    replySentStatus: string;
    userMeta: UserMeta;
}

export class ReplyTopicButton extends React.Component<ReplyTopicButtonProps, ReplyTopicButtonState> {

    constructor(props: ReplyTopicButtonProps) {
        super(props);

        this.state = {
            topicMessage: "",
            dialogOpen: false,
            replyStatusSuccessOpen: false,
            replyStatusErrorOpen: false,
            replySentStatus: "",
            userMeta: {name: "", suspended_until: Date.now() + 10000, times_suspended: 0}
        };

        this.toggleReplyTopicDialog = this.toggleReplyTopicDialog.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createTopicReply = this.createTopicReply.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        getCachedUserMeta().then(meta => this.setState({userMeta: meta}));
    }

    toggleReplyTopicDialog() {
        this.setState(prevState => ({dialogOpen: !prevState.dialogOpen}));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({topicMessage: event.target.value});
    }

    createTopicReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const topicMessage = this.state.topicMessage;
        this.setState({topicMessage: "", replyStatusSuccessOpen: true});

        createTopicReply(getUser(), this.props.topicId, topicMessage).then(() => {
            this.setState({replySentStatus: "Reply sent", replyStatusSuccessOpen: true});
            this.props.submitFunction();
        }).catch(() => this.setState({replySentStatus: "Error while sending reply", replyStatusErrorOpen: true}));
        this.toggleReplyTopicDialog();
    }

    createTopicButton() {
        if (getUser() != null && this.state.userMeta.suspended_until < Date.now()) {
            return (
                <div className="bottom-right-corner rounded-pink">
                    <IconButton aria-label="Reply to topic"
                                onClick={() => this.toggleReplyTopicDialog()}
                                style={{
                                    backgroundColor: "#FFAFC1",
                                    marginRight: "5px",
                                    marginBottom: "5px",
                                    height: "64px",
                                    width: "64px"
                                }}
                    >
                        <ReplyAll fontSize="large" className="new-topic-button"/>
                    </IconButton>
                </div>
            )
        }
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
                                rowsMax="15"
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

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.replyStatusSuccessOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="success"
                        message={this.state.replySentStatus}
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.replyStatusErrorOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="error"
                        message={this.state.replySentStatus}
                    />
                </Snackbar>
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

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({replyStatusSuccessOpen: false, replyStatusErrorOpen: false});
    }
}
