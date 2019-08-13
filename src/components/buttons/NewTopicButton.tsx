import React, { FormEvent } from "react";

import CreatableSelect from "react-select/creatable";
import { ValueType } from "react-select/src/types";
import {
  Badge,
  Dialog,
  Snackbar,
  Tab,
  Tabs,
  withStyles,
  WithStyles,
  Typography
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { getCachedUserMeta, getUser } from "../../util/user-util";
import IconButton from "@material-ui/core/IconButton";
import { Forum } from "@material-ui/icons";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";
import { createTopic } from "../../blockchain/TopicService";
import { UserMeta } from "../../types";
import { getTrendingChannels } from "../../blockchain/ChannelService";
import { largeButtonStyles } from "./ButtonStyles";
import {
  COLOR_CHROMIA_DARK,
  COLOR_CHROMIA_DARK_LIGHTER,
  COLOR_OFF_WHITE,
  COLOR_SOFT_PINK,
  COLOR_STEEL_BLUE
} from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";

interface OptionType {
  label: string;
  value: string;
}

export interface NewTopicButtonProps
  extends WithStyles<typeof largeButtonStyles> {
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
  suggestions: OptionType[];
  channel: ValueType<OptionType>;
  activeTab: number;
}

const maxTitleLength: number = 40;
const maxChannelLength: number = 20;

const NewTopicButton = withStyles(largeButtonStyles)(
  class extends React.Component<NewTopicButtonProps, NewTopicButtonState> {
    constructor(props: NewTopicButtonProps) {
      super(props);

      this.state = {
        topicTitle: "",
        topicChannel: this.props.channel,
        channel:
          this.props.channel !== ""
            ? { value: this.props.channel, label: this.props.channel }
            : null,
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

      this.toggleNewTopicDialog = this.toggleNewTopicDialog.bind(this);
      this.handleDialogTitleChange = this.handleDialogTitleChange.bind(this);
      this.handleChannelChange = this.handleChannelChange.bind(this);
      this.handleDialogMessageChange = this.handleDialogMessageChange.bind(
        this
      );
      this.createNewTopic = this.createNewTopic.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleChangeSingle = this.handleChangeSingle.bind(this);
      this.handleTabChange = this.handleTabChange.bind(this);
    }

    componentDidMount() {
      getCachedUserMeta().then(meta => this.setState({ userMeta: meta }));
      getTrendingChannels(7).then(channels =>
        this.setState({
          suggestions: channels.map(
            channel => ({ value: channel, label: channel } as OptionType)
          )
        })
      );
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

      if (this.state.channel == null) {
        this.setState({
          newTopicStatusMessage: "A channel must be supplied",
          newTopicErrorOpen: true
        });
      } else {
        const topicChannel: string = (this.state.channel as OptionType).value;

        if (!/^[a-zA-Z0-9\s]+$/.test(topicTitle)) {
          this.setState({
            newTopicStatusMessage:
              "Title may only contain a-z, A-Z & 0-9 characters and whitespaces",
            newTopicErrorOpen: true
          });
        } else if (topicTitle.length > maxTitleLength) {
          this.setState({
            newTopicStatusMessage: "Title is too long",
            newTopicErrorOpen: true
          });
        } else if (!/^[a-zA-Z0-9]+$/.test(topicChannel)) {
          this.setState({
            newTopicStatusMessage:
              "Channel may only contain a-z, A-Z & 0-9 characters",
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

          createTopic(getUser(), topicChannel, topicTitle, topicMessage)
            .then(() => {
              this.setState({
                newTopicStatusMessage: "topic created",
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
      if (
        getUser() != null &&
        this.state.userMeta.suspended_until < Date.now()
      ) {
        return (
          <div className={this.props.classes.buttonWrapper}>
            <IconButton
              aria-label="New topic"
              onClick={() => this.toggleNewTopicDialog()}
              className={this.props.classes.button}
            >
              <Forum fontSize="inherit" className={this.props.classes.icon} />
            </IconButton>
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
      const customStyles = {
        option: (provided: any, state: any) => ({
          ...provided,
          color: state.isSelected ? COLOR_SOFT_PINK : COLOR_OFF_WHITE,
          background: COLOR_CHROMIA_DARK_LIGHTER,
          borderBottom: "2px solid",
          borderBottomColor: COLOR_CHROMIA_DARK
        }),
        menu: (styles: any) => ({
          ...styles,
          zIndex: 999,
          background: COLOR_CHROMIA_DARK
        }),
        control: (provided: any) => ({
          ...provided,
          background: COLOR_CHROMIA_DARK,
          color: COLOR_SOFT_PINK,
          borderColor: COLOR_STEEL_BLUE,
          "&:hover": { borderColor: COLOR_OFF_WHITE },
          boxShadow: "none"
        }),
        singleValue: (provided: any, state: any) => {
          const opacity = state.isDisabled ? 1 : 1;
          const transition = "opacity 300ms";
          const color = COLOR_SOFT_PINK;
          return { ...provided, color, opacity, transition };
        },
        input: (provided: any, state: any) => {
          const color = COLOR_OFF_WHITE;
          return { ...provided, color };
        },
        noOptionsMessage: (provided: any, state: any) => {
          const color = COLOR_SOFT_PINK;
          return { color };
        }
      };
      return (
        <div>
          <Dialog
            open={this.state.dialogOpen}
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth={"sm"}
          >
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

                <Tabs
                  value={this.state.activeTab}
                  onChange={this.handleTabChange}
                  aria-label="New topic"
                >
                  <Tab
                    label={
                      <Typography component="span" variant="subtitle1">
                        Edit
                      </Typography>
                    }
                    {...this.a11yProps(0)}
                  />
                  <Tab
                    label={
                      <Typography component="span" variant="subtitle1">
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
                <Button
                  onClick={() => this.toggleNewTopicDialog()}
                  color="secondary"
                  variant="outlined"
                >
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
              vertical: "bottom",
              horizontal: "left"
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
              vertical: "bottom",
              horizontal: "left"
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
      );
    }

    renderEditor() {
      return (
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
        />
      );
    }

    renderPreview() {
      return <MarkdownRenderer text={this.state.topicMessage} />;
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

    private handleClose(
      event: React.SyntheticEvent | React.MouseEvent,
      reason?: string
    ) {
      if (reason === "clickaway") {
        return;
      }

      this.setState({ newTopicSuccessOpen: false, newTopicErrorOpen: false });
    }
  }
);

export default NewTopicButton;
