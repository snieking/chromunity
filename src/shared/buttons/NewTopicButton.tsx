import React, { FormEvent } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import { Badge, Dialog, Tab, Tabs, withStyles, WithStyles, Typography, Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { createTopic } from "../../core/services/TopicService";
import { ChromunityUser, PollSpecification } from "../../types";
import { getTrendingChannels } from "../../core/services/ChannelService";
import { largeButtonStyles } from "./ButtonStyles";
import { COLOR_RED } from "../../theme";
import MarkdownRenderer from "../MarkdownRenderer";
import withTheme from "@material-ui/core/styles/withTheme";
import { parseEmojis } from "../util/text-parsing";
import "emoji-mart/css/emoji-mart.css";
import Tooltip from "@material-ui/core/Tooltip";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import TextToolbar from "../textToolbar/TextToolbar";
import PollCreator from "../../features/topic/poll/PollCreator";
import PollIcon from "@material-ui/icons/Poll";
import { notifySuccess, setError } from "../../core/snackbar/redux/snackbarTypes";

export interface NewTopicButtonProps extends WithStyles<typeof largeButtonStyles> {
  updateFunction: Function;
  channel: string;
  theme: Theme;
  user: ChromunityUser;
  setSuccess: typeof notifySuccess;
  setError: typeof setError;
}

export interface NewTopicButtonState {
  dialogOpen: boolean;
  topicTitle: string;
  topicMessage: string;
  displayPoll: boolean;
  suggestions: string[];
  channel: string;
  activeTab: number;
  poll: PollSpecification;
}

const maxTitleLength: number = 40;
const maxChannelLength: number = 20;

const NewTopicButton = withStyles(largeButtonStyles)(
  withTheme(
    class extends React.Component<NewTopicButtonProps, NewTopicButtonState> {
      private readonly textInput: React.RefObject<HTMLInputElement>;

      constructor(props: NewTopicButtonProps) {
        super(props);

        this.state = {
          topicTitle: "",
          channel: this.props.channel ? this.props.channel : null,
          topicMessage: "",
          dialogOpen: false,
          displayPoll: false,
          suggestions: [],
          activeTab: 0,
          poll: {
            question: "",
            options: new Array<string>(),
          },
        };

        this.textInput = React.createRef();

        this.toggleNewTopicDialog = this.toggleNewTopicDialog.bind(this);
        this.handleDialogTitleChange = this.handleDialogTitleChange.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewTopic = this.createNewTopic.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.addText = this.addText.bind(this);
      }

      componentDidMount() {
        getTrendingChannels(7, 100).then((channels) =>
          this.setState({
            suggestions: channels.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
          })
        );
      }

      toggleNewTopicDialog() {
        this.setState((prevState) => ({ dialogOpen: !prevState.dialogOpen }));
      }

      handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicMessage: parseEmojis(event.target.value) });
      }

      handleDialogTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicTitle: event.target.value });
      }

      createNewTopic(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const topicTitle: string = this.state.topicTitle;
        const channel: string = this.state.channel;

        if (channel == null) {
          this.props.setError("A channel must be supplied");
        } else {
          if (topicTitle.length > maxTitleLength) {
            this.props.setError("Title is too long");
          } else if (!/^[a-zA-Z0-9]+$/.test(channel)) {
            this.props.setError("Channel may only contain a-z, A-Z & 0-9 characters");
          } else if (channel.length > maxChannelLength) {
            this.props.setError("Channel is too long");
          } else if (topicTitle.length < 3 || topicTitle.startsWith(" ")) {
            this.props.setError("Title must be longer than 3 characters, and must not start with a whitespace");
          } else {
            const topicMessage = this.state.topicMessage;
            this.setState({ topicTitle: "", topicMessage: "" });

            createTopic(this.props.user, channel, topicTitle, topicMessage, this.state.poll)
              .then(() => {
                this.props.setSuccess("Topic created");
                this.props.updateFunction();
              })
              .catch((error) => this.props.setError(error.message));
            this.toggleNewTopicDialog();
          }
        }
      }

      createTopicButton() {
        if (this.props.user != null) {
          return (
            <div className={this.props.classes.buttonWrapper} data-tut="new_topic">
              <Tooltip title="Create new topic">
                <IconButton
                  aria-label="New topic"
                  onClick={() => this.toggleNewTopicDialog()}
                  className={this.props.classes.button}
                >
                  <Forum fontSize="inherit" className={this.props.classes.icon} />
                </IconButton>
              </Tooltip>
            </div>
          );
        }
      }

      newThreadDialog() {
        return (
          <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"md"}>
            <form onSubmit={this.createNewTopic}>
              <DialogContent>
                <br />
                <Autocomplete
                  id="combo-box-demo"
                  options={this.state.suggestions}
                  style={{ maxWidth: "300px", width: "95%" }}
                  freeSolo
                  value={this.state.channel}
                  onChange={(event: any, newValue: string | null) => {
                    this.setState({ channel: newValue });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Channel"
                      variant="outlined"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        this.setState({ channel: event.target.value })
                      }
                    />
                  )}
                />
                <br />
                <Badge
                  color={maxTitleLength - this.state.topicTitle.length < 0 ? "error" : "primary"}
                  badgeContent={maxTitleLength - this.state.topicTitle.length}
                  showZero
                  style={{ maxWidth: "350px", width: "95%" }}
                >
                  <TextField
                    autoFocus
                    margin="dense"
                    type="text"
                    id="title"
                    label="Title"
                    onChange={this.handleDialogTitleChange}
                    value={this.state.topicTitle}
                    variant="outlined"
                    fullWidth
                  />
                </Badge>
                <Tabs value={this.state.activeTab} onChange={this.handleTabChange} aria-label="New topic">
                  <Tab
                    label={
                      <Typography component="span" variant="body2">
                        Editor
                      </Typography>
                    }
                    {...this.a11yProps(0)}
                  />
                  <Tab
                    label={
                      <Typography component="span" variant="body2">
                        Preview
                      </Typography>
                    }
                    {...this.a11yProps(1)}
                  />
                </Tabs>
                {this.state.activeTab === 0 && this.renderEditor()}
                {this.state.activeTab === 1 && this.renderPreview()}
                {this.renderPoll()}
              </DialogContent>
              <DialogActions>
                {this.pollToggleButton()}
                <Button onClick={() => this.toggleNewTopicDialog()} color="secondary" variant="contained">
                  Cancel
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  Create
                </Button>
                <br />
              </DialogActions>
            </form>
          </Dialog>
        );
      }

      renderPoll() {
        return (
          <>
            {this.state.displayPoll && (
              <div className={this.props.classes.pollWrapper}>
                <PollCreator poll={this.state.poll} />
              </div>
            )}
          </>
        );
      }

      pollToggleButton() {
        return (
          <IconButton onClick={() => this.setState((prevState) => ({ displayPoll: !prevState.displayPoll }))}>
            <PollIcon style={{ color: this.state.displayPoll ? COLOR_RED : "" }} />
          </IconButton>
        );
      }

      renderEditor() {
        return (
          <div className={this.props.classes.editorWrapper}>
            <TextToolbar addText={this.addText} />
            <TextField
              margin="dense"
              id="message"
              multiline
              label="Content"
              type="text"
              fullWidth
              rows="5"
              rowsMax="15"
              onChange={this.handleDialogMessageChange}
              value={this.state.topicMessage}
              variant="outlined"
              inputRef={this.textInput}
            />
          </div>
        );
      }

      addText(text: string) {
        const startPosition = this.textInput.current.selectionStart;

        this.setState((prevState) => ({
          topicMessage: [
            prevState.topicMessage.slice(0, startPosition),
            text,
            prevState.topicMessage.slice(startPosition),
          ].join(""),
        }));

        setTimeout(() => {
          this.textInput.current.selectionStart = startPosition + text.length;
          this.textInput.current.selectionEnd = startPosition + text.length;
        }, 100);
      }

      renderPreview() {
        return (
          <div>
            <MarkdownRenderer text={this.state.topicMessage} />
          </div>
        );
      }

      a11yProps(index: number) {
        return {
          id: `simple-tab-${index}`,
          "aria-controls": `simple-tabpanel-${index}`,
        };
      }

      handleTabChange(event: React.ChangeEvent<{}>, newValue: number) {
        this.setState({ activeTab: newValue });
      }

      render() {
        return (
          <div>
            {this.createTopicButton()}
            {this.newThreadDialog()}
          </div>
        );
      }
    }
  )
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setSuccess: (msg: string) => dispatch(notifySuccess(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewTopicButton);
