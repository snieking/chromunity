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
  Snackbar,
  TextField,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import AvatarChanger from "./AvatarChanger";

import { getUserSettings, updateUserSettings } from "../../../blockchain/UserService";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import { Socials } from "../socials/socialTypes";

const styles = createStyles({
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
  },
  commitBtnWrapper: {
    textAlign: "center",
    marginTop: "5px",
  },
});

interface Props extends WithStyles<typeof styles> {
  user: ChromunityUser;
}

interface SettingsState {
  avatar: string;
  editedAvatar: string;
  editAvatarOpen: boolean;
  description: string;
  socials: Socials;
  updateSuccessOpen: boolean;
  updateErrorOpen: boolean;
  settingsUpdateStatus: string;
}

const Settings = withStyles(styles)(
  class extends React.Component<Props, SettingsState> {
    constructor(props: Props) {
      super(props);
      this.state = {
        avatar: "",
        editedAvatar: "",
        editAvatarOpen: false,
        description: "",
        socials: {
          twitter: "",
          linkedin: "",
        },
        updateSuccessOpen: false,
        updateErrorOpen: false,
        settingsUpdateStatus: "",
      };

      this.updateAvatar = this.updateAvatar.bind(this);
      this.commitAvatar = this.commitAvatar.bind(this);
      this.saveSettings = this.saveSettings.bind(this);
      this.toggleEditAvatarDialog = this.toggleEditAvatarDialog.bind(this);
      this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
      this.handleClose = this.handleClose.bind(this);
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
          });
        });
      }
    }

    render() {
      return (
        <div>
          <Container fixed maxWidth="sm">
            <ChromiaPageHeader text="Edit Settings" />
            <Card key={"user-card"}>
              {this.avatarEditor()}
              {this.descriptionEditor()}
              {this.socialsEditor()}
            </Card>
            {this.saveButton()}
          </Container>
          {this.snackBars()}
        </div>
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
          label="Profile description"
          type="text"
          variant="outlined"
          onChange={this.handleDescriptionChange}
          value={this.state.description}
        />
      );
    }

    private socialsEditor() {
      return (
        <>
          <TextField
            id="twitter"
            margin="dense"
            label="Twitter Profile URL"
            type="text"
            variant="outlined"
            onChange={this.handleTwitterChange}
            value={this.state.socials.twitter}
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

    private snackBars() {
      return (
        <>
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={this.state.updateSuccessOpen}
            autoHideDuration={3000}
            onClose={this.handleClose}
          >
            <CustomSnackbarContentWrapper variant="success" message={this.state.settingsUpdateStatus} />
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={this.state.updateErrorOpen}
            autoHideDuration={3000}
            onClose={this.handleClose}
          >
            <CustomSnackbarContentWrapper variant="error" message={this.state.settingsUpdateStatus} />
          </Snackbar>
        </>
      );
    }

    private handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
      this.setState({ description: event.target.value });
    }

    private handleTwitterChange(event: React.ChangeEvent<HTMLInputElement>) {
      this.setState((prevState) => ({
        socials: { twitter: event.target.value, linkedin: prevState.socials.linkedin },
      }));
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
      updateUserSettings(this.props.user, this.state.avatar, this.state.description)
        .then(() =>
          this.setState({
            settingsUpdateStatus: "Settings saved",
            updateSuccessOpen: true,
          })
        )
        .catch(() =>
          this.setState({
            settingsUpdateStatus: "Error updating settings",
            updateErrorOpen: true,
          })
        );
    }

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
      if (reason === "clickaway") {
        return;
      }

      this.setState({ updateSuccessOpen: false, updateErrorOpen: false });
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(Settings);
