import React, { FormEvent } from "react";

import './Buttons.css';

import { Dialog, Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogTitle from "@material-ui/core/DialogTitle";
import { getUser } from "../../util/user-util";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { CustomSnackbarContentWrapper } from "../utils/CustomSnackbar";
import { createTopic } from "../../blockchain/TopicService";


export interface NewTopicButtonProps {
    updateFunction: Function;
}

export interface NewTopicButtonState {
    dialogOpen: boolean;
    topicTitle: string;
    topicMessage: string;
    snackbarOpen: boolean;
}

export class NewTopicButton extends React.Component<NewTopicButtonProps, NewTopicButtonState> {

    constructor(props: NewTopicButtonProps) {
        super(props);

        this.state = {
            topicTitle: "",
            topicMessage: "",
            dialogOpen: false,
            snackbarOpen: false
        };

        this.toggleNewTopicDialog = this.toggleNewTopicDialog.bind(this);
        this.handleDialogTitleChange = this.handleDialogTitleChange.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewTopic = this.createNewTopic.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    toggleNewTopicDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicMessage: event.target.value });
    }

    handleDialogTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicTitle: event.target.value });
    }

    createNewTopic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const topicTitle: string = this.state.topicTitle;
        const topicMessage = this.state.topicMessage;
        this.setState({ topicTitle: "", topicMessage: "", snackbarOpen: true });

        createTopic(getUser(), topicTitle || "", topicMessage || "").then(() => this.props.updateFunction());
        this.toggleNewTopicDialog();
    }

    createTopicButton() {
        if (getUser().name != null) {
            return (
                <div className="bottom-right-corner rounded-pink">
                    <IconButton aria-label="New topic"
                        onClick={() => this.toggleNewTopicDialog()}
                        style={{ backgroundColor: "#FFAFC1", marginRight: "5px", marginBottom: "5px" }}
                    >
                        <Forum fontSize="large" className="new-topic-button" />
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
                        <DialogTitle>New topic</DialogTitle>
                        <DialogContent>
                            <br/>
                            <label>Title</label>
                        <TextField
                                autoFocus
                                margin="dense"
                                id="title"
                                multiline
                                fullWidth
                                onChange={this.handleDialogTitleChange}
                                value={this.state.topicTitle}
                            />
                            <br/>
                            <br/>
                            <br/>
                            <label>Content</label>
                            <TextField
                                margin="dense"
                                id="message"
                                multiline
                                type="text"
                                fullWidth
                                onChange={this.handleDialogMessageChange}
                                value={this.state.topicMessage}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.toggleNewTopicDialog()} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Create
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
                        message={"Topic created"}
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
                {this.createTopicButton()}
                {this.newThreadDialog()}
            </div>
        )
    }
}
