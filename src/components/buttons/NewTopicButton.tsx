import React, { FormEvent } from "react";

import CreatableSelect from "react-select/creatable";
import { ValueType } from "react-select/src/types";
import { Badge, Dialog, Snackbar, Tab, Tabs, withStyles, WithStyles, Typography, Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { getCachedUserMeta } from "../../util/user-util";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";
import { createTopic } from "../../blockchain/TopicService";
import { ChromunityUser, UserMeta } from "../../types";
import { getTrendingChannels } from "../../blockchain/ChannelService";
import { largeButtonStyles } from "./ButtonStyles";
import {
  COLOR_CHROMIA_DARK,
  COLOR_CHROMIA_DARK_LIGHTER,
  COLOR_CHROMIA_LIGHT,
  COLOR_CHROMIA_LIGHTER,
  COLOR_OFF_WHITE
} from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";
import withTheme from "@material-ui/core/styles/withTheme";
import { parseEmojis } from "../../util/text-parsing";
import "emoji-mart/css/emoji-mart.css";
import EmojiPicker from "../common/EmojiPicker";
import Tooltip from "@material-ui/core/Tooltip";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";

interface OptionType {
  label: string;
  value: string;
}

export interface NewTopicButtonProps extends WithStyles<typeof largeButtonStyles> {
  updateFunction: Function;
  channel: string;
  theme: Theme;
  user: ChromunityUser;
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
  suggestions: OptionType[];
  channel: ValueType<OptionType>;
  activeTab: number;
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
          topicChannel: this.props.channel,
          channel: this.props.channel !== "" ? { value: this.props.channel, label: this.props.channel } : null,
          topicMessage: "",
          dialogOpen: false,
          newTopicSuccessOpen: false,
          newTopicErrorOpen: false,
          newTopicStatusMessage: "",
          userMeta: {
            name: "",
            suspended_until: Date.now() + 10000,
            times_suspended: 0
          },
          suggestions: [],
          activeTab: 0
        };

        this.textInput = React.createRef();

        this.toggleNewTopicDialog = this.toggleNewTopicDialog.bind(this);
        this.handleDialogTitleChange = this.handleDialogTitleChange.bind(this);
        this.handleChannelChange = this.handleChannelChange.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewTopic = this.createNewTopic.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChangeSingle = this.handleChangeSingle.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.addEmoji = this.addEmoji.bind(this);
      }

      componentDidMount() {
        getCachedUserMeta().then(meta => this.setState({ userMeta: meta }));
        getTrendingChannels(7).then(channels =>
          this.setState({
            suggestions: channels.map(channel => ({ value: channel, label: channel } as OptionType))
          })
        );
      }

      toggleNewTopicDialog() {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
      }

      handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ topicMessage: parseEmojis(event.target.value) });
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

        if (this.state.channel == null) {
          this.setState({
            newTopicStatusMessage: "A channel must be supplied",
            newTopicErrorOpen: true
          });
        } else {
          const topicChannel: string = (this.state.channel as OptionType).value;

          if (topicTitle.length > maxTitleLength) {
            this.setState({
              newTopicStatusMessage: "Title is too long",
              newTopicErrorOpen: true
            });
          } else if (!/^[a-zA-Z0-9]+$/.test(topicChannel)) {
            this.setState({
              newTopicStatusMessage: "Channel may only contain a-z, A-Z & 0-9 characters",
              newTopicErrorOpen: true
            });
          } else if (topicChannel.length > maxChannelLength) {
            this.setState({
              newTopicStatusMessage: "Channel is too long",
              newTopicErrorOpen: true
            });
          } else {
            const topicMessage = this.state.topicMessage;
            this.setState({ topicTitle: "", topicMessage: "" });

            createTopic(this.props.user, topicChannel, topicTitle, topicMessage)
              .then(() => {
                this.setState({
                  newTopicStatusMessage: "Topic created",
                  newTopicSuccessOpen: true
                });
                this.props.updateFunction();
              })
              .catch(() =>
                this.setState({
                  newTopicStatusMessage: "Error while creating topic",
                  newTopicErrorOpen: true
                })
              );
            this.toggleNewTopicDialog();
          }
        }
      }

      createTopicButton() {
        if (this.props.user != null && this.state.userMeta.suspended_until < Date.now()) {
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

      handleChangeSingle(value: ValueType<OptionType>) {
        if (value != null) {
          this.setState({ channel: value });
        }
      }

      newThreadDialog() {
        const { theme } = this.props;
        const darkTheme = theme.palette.type === "dark";

        const textColor = darkTheme ? COLOR_OFF_WHITE : COLOR_CHROMIA_DARK;
        const backgroundColor = darkTheme ? COLOR_CHROMIA_DARK : COLOR_CHROMIA_LIGHTER;
        const borderColor = darkTheme ? COLOR_CHROMIA_DARK_LIGHTER : COLOR_CHROMIA_LIGHT;

        const customStyles = {
          option: (provided: any) => ({
            ...provided,
            color: textColor,
            background: backgroundColor,
            border: "1px solid",
            borderColor: borderColor
          }),
          menu: (styles: any) => ({
            ...styles,
            zIndex: 999,
            background: backgroundColor
          }),
          control: (provided: any) => ({
            ...provided,
            background: backgroundColor,
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            "&:hover": { borderColor: textColor },
            boxShadow: "none"
          }),
          singleValue: (provided: any, state: any) => {
            const opacity = state.isDisabled ? 1 : 1;
            const transition = "opacity 300ms";
            const color = textColor;
            return { ...provided, color, opacity, transition };
          },
          input: (provided: any) => {
            const color = textColor;
            return { ...provided, color };
          },
          noOptionsMessage: (provided: any) => {
            const color = textColor;
            return { ...provided, color };
          }
        };
        return (
          <div>
            <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"md"}>
              <form onSubmit={this.createNewTopic}>
                <DialogContent>
                  <br />
                  <CreatableSelect
                    placeholder={"Select or create channel..."}
                    isSearchable={true}
                    options={this.state.suggestions}
                    value={this.state.channel}
                    onChange={this.handleChangeSingle}
                    styles={customStyles}
                  />
                  <br />
                  <Badge color="secondary" badgeContent={maxTitleLength - this.state.topicTitle.length} showZero>
                    <TextField
                      autoFocus
                      margin="dense"
                      type="text"
                      id="title"
                      label="Title"
                      fullWidth
                      onChange={this.handleDialogTitleChange}
                      value={this.state.topicTitle}
                      variant="outlined"
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
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => this.toggleNewTopicDialog()} color="secondary" variant="contained">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" variant="contained">
                    Create topic
                  </Button>
                  <br />
                </DialogActions>
              </form>
            </Dialog>

            <Snackbar
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
              open={this.state.newTopicSuccessOpen}
              autoHideDuration={3000}
              onClose={this.handleClose}
            >
              <CustomSnackbarContentWrapper variant="success" message={this.state.newTopicStatusMessage} />
            </Snackbar>
            <Snackbar
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
              open={this.state.newTopicErrorOpen}
              autoHideDuration={3000}
              onClose={this.handleClose}
            >
              <CustomSnackbarContentWrapper
                onClose={this.handleClose}
                variant="error"
                message={this.state.newTopicStatusMessage}
              />
            </Snackbar>
          </div>
        );
      }

      renderEditor() {
        return (
          <div className={this.props.classes.editorWrapper}>
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
            <EmojiPicker emojiAppender={this.addEmoji} />
          </div>
        );
      }

      addEmoji(emoji: string) {
        const startPosition = this.textInput.current.selectionStart;

        this.setState(prevState => ({
          topicMessage: [
            prevState.topicMessage.slice(0, startPosition),
            emoji,
            prevState.topicMessage.slice(startPosition)
          ].join("")
        }));

        setTimeout(() => {
          this.textInput.current.selectionStart = startPosition + emoji.length;
          this.textInput.current.selectionEnd = startPosition + emoji.length;
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
          "aria-controls": `simple-tabpanel-${index}`
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

      private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
        if (reason === "clickaway") {
          return;
        }

        this.setState({ newTopicSuccessOpen: false, newTopicErrorOpen: false });
      }
    }
  )
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(NewTopicButton);
