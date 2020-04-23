import React from "react";
import { ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import { ChromunityUser, UserSettings } from "../../../types";
import {
  Button,
  Card,
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  withStyles,
  WithStyles,
  Grid,
  Theme,
  Typography,
} from "@material-ui/core";
import AvatarChanger from "./AvatarChanger";

import { getUserSettings, updateUserSettings } from "../../../blockchain/UserService";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { Socials } from "../socials/socialTypes";
import { TwitterIcon, LinkedinIcon, FacebookIcon } from "react-share";
import * as config from "../../../config";
import GitHubLogo from "../../common/logos/GitHubLogo";
import { setError, setInfo } from "../../snackbar/redux/snackbarTypes";

const styles = (theme: Theme) =>
  createStyles({
    settingsCard: {
      marginBottom: "10px",
    },
    chapterHeader: {
      marginTop: "5px",
      textAlign: "center",
    },
    avatarWrapper: {
      float: "left",
      marginTop: "10px",
      marginLeft: "10px",
      opacity: 0.8,
      "&:hover": {
        cursor: "pointer",
        opacity: 1,
      },
    },
    description: {
      marginTop: "15px",
      marginLeft: "10px",
      width: "80%",
      [theme.breakpoints.down("xs")]: {
        width: "55%",
      },
    },
    commitBtnWrapper: {
      textAlign: "center",
      marginTop: "5px",
    },
    socialsWrapper: {
      margin: "10px",
    },
    socialsBlock: {},
    socialsField: {
      width: "80%",
      [theme.breakpoints.down("xs")]: {
        width: "55%",
      },
    },
    socialsIcon: {
      marginRight: "10px",
      position: "relative",
      top: 15,
      display: "inline",
    },
  });

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
  setInfo: typeof setInfo;
  setError: typeof setError;
}

interface SettingsState {
  avatar: string;
  editedAvatar: string;
  editAvatarOpen: boolean;
  description: string;
  socials: Socials;
}

const DEFAULT_SOCIALS: Socials = { twitter: "", linkedin: "", facebook: "", github: "" };
const ICON_SIZE = 24;

const Settings = withStyles(styles)(
  class extends React.Component<Props, SettingsState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        avatar: "",
        editedAvatar: "",
        editAvatarOpen: false,
        description: "",
        socials: DEFAULT_SOCIALS,
      };

      this.updateAvatar = this.updateAvatar.bind(this);
      this.commitAvatar = this.commitAvatar.bind(this);
      this.saveSettings = this.saveSettings.bind(this);
      this.toggleEditAvatarDialog = this.toggleEditAvatarDialog.bind(this);
      this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
      this.handleTwitterChange = this.handleTwitterChange.bind(this);
      this.handleLinkedInChange = this.handleLinkedInChange.bind(this);
      this.handleFacebookChange = this.handleFacebookChange.bind(this);
      this.handleGithubChange = this.handleGithubChange.bind(this);
    }

    componentDidMount() {
      const user: ChromunityUser = this.props.user;
      if (user == null) {
        window.location.href = "/user/login";
      } else {
        getUserSettings(user).then((settings: UserSettings) => {
          this.setState({
            avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, user.name),
            description: settings.description,
            socials: settings.socials ? (JSON.parse(settings.socials) as Socials) : DEFAULT_SOCIALS,
          });
        });
      }
    }

    render() {
      return (
        <Container fixed maxWidth="sm">
          <ChromiaPageHeader text="Edit Settings" />
          <Card key={"user-card"} className={this.props.classes.settingsCard}>
            <Typography variant="h6" component="h6" className={this.props.classes.chapterHeader}>
              General
            </Typography>
            {this.avatarEditor()}
            {this.descriptionEditor()}
          </Card>
          <Card key={"socials-card"} className={this.props.classes.settingsCard}>
            <Typography variant="h6" component="h6" className={this.props.classes.chapterHeader}>
              Social Profiles
            </Typography>
            {this.socialsEditor()}
          </Card>
          {this.saveButton()}
        </Container>
      );
    }

    private avatarEditor() {
      return (
        <>
          <Dialog open={this.state.editAvatarOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"sm"}>
            <DialogTitle>Edit your avatar</DialogTitle>
            <DialogContent>
              <AvatarChanger updateFunction={this.updateAvatar} previousPicture={this.state.avatar} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.toggleEditAvatarDialog()} variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button onClick={() => this.commitAvatar()} variant="outlined" color="primary">
                Send
              </Button>
            </DialogActions>
          </Dialog>
          <div className={this.props.classes.avatarWrapper}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} onClick={() => this.toggleEditAvatarDialog()} />
          </div>
        </>
      );
    }

    private descriptionEditor() {
      return (
        <TextField
          className={this.props.classes.description}
          margin="dense"
          id="description"
          multiline
          rows="2"
          rowsMax={3}
          label="Description"
          type="text"
          variant="outlined"
          onChange={this.handleDescriptionChange}
          value={this.state.description}
        />
      );
    }

    private socialsEditor() {
      return (
        <Grid container className={this.props.classes.socialsWrapper}>
          <Grid item xs={6} className={this.props.classes.socialsBlock}>
            {this.twitterInput()}
          </Grid>
          <Grid item xs={6} className={this.props.classes.socialsBlock}>
            {this.linkedInInput()}
          </Grid>
          <Grid item xs={6} className={this.props.classes.socialsBlock}>
            {this.facebookInput()}
          </Grid>
          <Grid item xs={6} className={this.props.classes.socialsBlock}>
            {this.githubInput()}
          </Grid>
        </Grid>
      );
    }

    private twitterInput() {
      return (
        <>
          <TwitterIcon size={ICON_SIZE} className={this.props.classes.socialsIcon} />
          <TextField
            disabled={!config.features.userSocialsEnabled}
            className={this.props.classes.socialsField}
            id="twitter"
            margin="dense"
            label="Twitter"
            placeholder="Username"
            type="text"
            variant="outlined"
            onChange={this.handleTwitterChange}
            value={this.state.socials.twitter}
          />
        </>
      );
    }

    private linkedInInput() {
      return (
        <>
          <LinkedinIcon size={ICON_SIZE} className={this.props.classes.socialsIcon} />
          <TextField
            disabled={!config.features.userSocialsEnabled}
            className={this.props.classes.socialsField}
            id="twitter"
            margin="dense"
            label="LinkedIn"
            placeholder="Username"
            type="text"
            variant="outlined"
            onChange={this.handleLinkedInChange}
            value={this.state.socials.linkedin}
          />
        </>
      );
    }

    private facebookInput() {
      return (
        <>
          <FacebookIcon size={ICON_SIZE} className={this.props.classes.socialsIcon} />
          <TextField
            disabled={!config.features.userSocialsEnabled}
            className={this.props.classes.socialsField}
            id="facebook"
            margin="dense"
            label="Facebook"
            placeholder="Username"
            type="text"
            variant="outlined"
            onChange={this.handleFacebookChange}
            value={this.state.socials.facebook}
          />
        </>
      );
    }

    private githubInput() {
      return (
        <>
          <div className={this.props.classes.socialsIcon}>
            <GitHubLogo />
          </div>
          <TextField
            disabled={!config.features.userSocialsEnabled}
            className={this.props.classes.socialsField}
            id="github"
            margin="dense"
            label="Github"
            placeholder="Username"
            type="text"
            variant="outlined"
            onChange={this.handleGithubChange}
            value={this.state.socials.github}
          />
        </>
      );
    }

    private saveButton() {
      return (
        <div className={this.props.classes.commitBtnWrapper}>
          <Button size="large" variant="contained" color="primary" onClick={() => this.saveSettings()}>
            Save
          </Button>
        </div>
      );
    }

    private handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
      this.setState({ description: event.target.value });
    }

    private handleTwitterChange(event: React.ChangeEvent<HTMLInputElement>) {
      const socials: Socials = {
        twitter: event.target.value,
        linkedin: this.state.socials.linkedin,
        facebook: this.state.socials.facebook,
        github: this.state.socials.github,
      };

      this.setState({ socials });
    }

    private handleLinkedInChange(event: React.ChangeEvent<HTMLInputElement>) {
      const socials: Socials = {
        linkedin: event.target.value,
        twitter: this.state.socials.twitter,
        facebook: this.state.socials.facebook,
        github: this.state.socials.github,
      };

      this.setState({ socials });
    }

    private handleFacebookChange(event: React.ChangeEvent<HTMLInputElement>) {
      const socials: Socials = {
        linkedin: this.state.socials.linkedin,
        twitter: this.state.socials.twitter,
        facebook: event.target.value,
        github: this.state.socials.github,
      };

      this.setState({ socials });
    }

    private handleGithubChange(event: React.ChangeEvent<HTMLInputElement>) {
      const socials: Socials = {
        linkedin: this.state.socials.linkedin,
        twitter: this.state.socials.twitter,
        facebook: this.state.socials.facebook,
        github: event.target.value,
      };

      this.setState({ socials });
    }

    private toggleEditAvatarDialog() {
      this.setState((prevState) => ({
        editAvatarOpen: !prevState.editAvatarOpen,
      }));
    }

    private updateAvatar(updatedAvatar: string) {
      this.setState({ editedAvatar: updatedAvatar });
    }

    private commitAvatar() {
      this.setState((prevState) => ({
        avatar: prevState.editedAvatar,
        editAvatarOpen: false,
      }));
    }

    private saveSettings() {
      updateUserSettings(
        this.props.user,
        this.state.avatar,
        this.state.description,
        config.features.userSocialsEnabled ? this.state.socials : null
      )
        .then(() => this.props.setInfo("Settings saved"))
        .catch(() => this.props.setError("Error updating settings"));
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setInfo: (msg: string) => dispatch(setInfo(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
