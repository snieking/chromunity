import React, { FormEvent } from "react";

import CreatableSelect from "react-select/creatable";
import { ValueType } from "react-select/src/types";
import { Badge, Dialog, Tab, Tabs, withStyles, WithStyles, Typography, Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { createTopic } from "../../blockchain/TopicService";
import { ChromunityUser, PollSpecification } from "../../types";
import { getTrendingChannels } from "../../blockchain/ChannelService";
import { largeButtonStyles } from "./ButtonStyles";
import {
  COLOR_CHROMIA_DARK,
  COLOR_CHROMIA_DARK_LIGHTER,
  COLOR_CHROMIA_LIGHT,
  COLOR_CHROMIA_LIGHTER,
  COLOR_OFF_WHITE,
  COLOR_RED,
} from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";
import withTheme from "@material-ui/core/styles/withTheme";
import { parseEmojis } from "../../util/text-parsing";
import "emoji-mart/css/emoji-mart.css";
import Tooltip from "@material-ui/core/Tooltip";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import TextToolbar from "../common/textToolbar/TextToolbar";
import PollCreator from "../topic/poll/PollCreator";
import PollIcon from "@material-ui/icons/Poll";
import { setInfo, setError } from "../snackbar/redux/snackbarTypes";

interface OptionType {
  label: string;
  value: string;
}

export interface NewTopicButtonProps extends WithStyles<typeof largeButtonStyles> {
  updateFunction: Function;
  channel: string;
  theme: Theme;
  user: ChromunityUser;
  setInfo: typeof setInfo;
  setError: typeof setError;
}

export interface NewTopicButtonState {
  dialogOpen: boolean;
  topicTitle: string;
  topicChannel: string;
  topicMessage: string;
  displayPoll: boolean;
  suggestions: OptionType[];
  channel: ValueType<OptionType>;
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
          topicChannel: this.props.channel,
          channel: this.props.channel !== "" ? { value: this.props.channel, label: this.props.channel } : null,
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
        this.handleChannelChange = this.handleChannelChange.bind(this);
        this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
        this.createNewTopic = this.createNewTopic.bind(this);
        this.handleChangeSingle = this.handleChangeSingle.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.addText = this.addText.bind(this);
      }

      componentDidMount() {
        getTrendingChannels(7).then((channels) =>
          this.setState({
            suggestions: channels.map((channel) => ({ value: channel, label: channel } as OptionType)),
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
          this.props.setError("A channel must be supplied");
        } else {
          const topicChannel: string = (this.state.channel as OptionType).value;

          if (topicTitle.length > maxTitleLength) {
            this.props.setError("Title is too long");
          } else if (!/^[a-zA-Z0-9]+$/.test(topicChannel)) {
            this.props.setError("Channel may only contain a-z, A-Z & 0-9 characters");
          } else if (topicChannel.length > maxChannelLength) {
            this.props.setError("Channel is too long");
          } else if (topicTitle.length < 3 || topicTitle.startsWith(" ")) {
            this.props.setError("Title must be longer than 3 characters, and must not start with a whitespace");
          } else {
            const topicMessage = this.state.topicMessage;
            this.setState({ topicTitle: "", topicMessage: "" });

            createTopic(this.props.user, topicChannel, topicTitle, topicMessage, this.state.poll)
              .then(() => {
                this.props.setInfo("Topic created");
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
            borderColor: borderColor,
          }),
          menu: (styles: any) => ({
            ...styles,
            zIndex: 999,
            background: backgroundColor,
          }),
          control: (provided: any) => ({
            ...provided,
            background: backgroundColor,
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            "&:hover": { borderColor: textColor },
            boxShadow: "none",
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
          },
        };
        return (
          <Dialog open={this.state.dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"md"}>
            <form onSubmit={this.createNewTopic}>
              <DialogContent>
                <br />
                <CreatableSelect
                  placeholder={"Create or select channel..."}
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
    setInfo: (msg: string) => dispatch(setInfo(msg))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewTopicButton);
