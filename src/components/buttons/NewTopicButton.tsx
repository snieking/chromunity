import React, { FormEvent } from "react";

import './Buttons.css';

import { Dialog, Snackbar, Badge } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { getUser, getCachedUserMeta } from "../../util/user-util";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { CustomSnackbarContentWrapper } from "../utils/CustomSnackbar";
import { createTopic } from "../../blockchain/TopicService";
import { UserMeta } from "../../types";


export interface NewTopicButtonProps {
    updateFunction: Function;
    channel: string;
}

export interface NewTopicButtonState {
    dialogOpen: boolean;
    topicTitle: string;
    topicChannel: string;
    topicMessage: string;
    newTopicSuccessOpen: boolean;
    newTopicErrorOpen: boolean;
    newTopicStatusMessage: string;
    userMeta: UserMeta;
}

const maxTitleLength: number = 40;
const maxChannelLength: number = 20;

export class NewTopicButton extends React.Component<NewTopicButtonProps, NewTopicButtonState> {

    constructor(props: NewTopicButtonProps) {
        super(props);

        this.state = {
            topicTitle: "",
            topicChannel: this.props.channel,
            topicMessage: "",
            dialogOpen: false,
            newTopicSuccessOpen: false,
            newTopicErrorOpen: false,
            newTopicStatusMessage: "",
            userMeta: { name: "", suspended_until: Date.now() + 10000, times_suspended: 0 }
        };

        this.toggleNewTopicDialog = this.toggleNewTopicDialog.bind(this);
        this.handleDialogTitleChange = this.handleDialogTitleChange.bind(this);
        this.handleChannelChange = this.handleChannelChange.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewTopic = this.createNewTopic.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        getCachedUserMeta().then(meta => this.setState({ userMeta: meta }));
    }

    toggleNewTopicDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicMessage: event.target.value });
    }

    handleChannelChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicChannel: event.target.value });
    }

    handleDialogTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicTitle: event.target.value });
    }

    createNewTopic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const topicTitle: string = this.state.topicTitle;
        const topicChannel: string = this.state.topicChannel;

        if (!/^[a-zA-Z0-9\s]+$/.test(topicTitle)) {
            this.setState({ newTopicStatusMessage: "Title may only contain a-z, A-Z & 0-9 characters", newTopicErrorOpen: true });
        } else if (topicTitle.length > maxTitleLength) {
            this.setState({ newTopicStatusMessage: "Title is too long", newTopicErrorOpen: true });
        } else if (!/^[a-zA-Z0-9\s]+$/.test(topicChannel)) {
            this.setState({ newTopicStatusMessage: "Channel may only contain a-z, A-Z & 0-9 characters", newTopicErrorOpen: true });
        } else if (topicChannel.length > maxChannelLength) {
            this.setState({ newTopicStatusMessage: "Channel is too long", newTopicErrorOpen: true });
        } else {
            const topicMessage = this.state.topicMessage;
            this.setState({ topicTitle: "", topicMessage: "" });

            createTopic(getUser(), topicChannel, topicTitle, topicMessage).then(() => {
                this.setState({ newTopicStatusMessage: "Topic created", newTopicSuccessOpen: true });
                this.props.updateFunction();
            }).catch(() => this.setState({ newTopicStatusMessage: "Error while creating topic", newTopicErrorOpen: true }));
            this.toggleNewTopicDialog();
        }
    }

    createTopicButton() {
        if (getUser().name != null && this.state.userMeta.suspended_until < Date.now()) {
            return (
                <div className="bottom-right-corner rounded-pink">
                    <IconButton aria-label="New topic"
                        onClick={() => this.toggleNewTopicDialog()}
                        style={{ backgroundColor: "#FFAFC1", marginRight: "5px", marginBottom: "5px", height: "64px", width: "64px" }}
                    >
                        <Forum fontSize="inherit" className="new-topic-button" />
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
                    <form onSubmit={this.createNewTopic}>
                        <DialogContent>
                            <br />
                            <Badge
                                className="input-field-badge"
                                color="secondary"
                                badgeContent={maxTitleLength - this.state.topicTitle.length}
                                showZero
                            >
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="title"
                                    label="Title"
                                    multiline
                                    fullWidth
                                    onChange={this.handleDialogTitleChange}
                                    value={this.state.topicTitle}
                                    className="text-field"
                                    variant="outlined"
                                />
                            </Badge>
                            <Badge
                                className="input-field-badge"
                                color="secondary"
                                badgeContent={maxChannelLength - this.state.topicChannel.length}
                                showZero
                            >
                                <TextField
                                    margin="dense"
                                    id="topicChannel"
                                    multiline
                                    label="Channel"
                                    type="text"
                                    fullWidth
                                    rows="1"
                                    onChange={this.handleChannelChange}
                                    value={this.state.topicChannel}
                                    variant="outlined"
                                />
                            </Badge>
                            <TextField
                                margin="dense"
                                id="message"
                                multiline
                                label="Content"
                                type="text"
                                fullWidth
                                rows="3"
                                onChange={this.handleDialogMessageChange}
                                value={this.state.topicMessage}
                                variant="outlined"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.toggleNewTopicDialog()} color="secondary" variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="outlined">
                                Create topic
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.newTopicSuccessOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="success"
                        message={this.state.newTopicStatusMessage}
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.newTopicErrorOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="error"
                        message={this.state.newTopicStatusMessage}
                    />
                </Snackbar>
            </div>
        )
    }

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ newTopicSuccessOpen: false, newTopicErrorOpen: false });
    }

    render() {
        return (
            <div>
                {this.createTopicButton()}
                {this.newThreadDialog()}
            </div>
        )
    }
}
