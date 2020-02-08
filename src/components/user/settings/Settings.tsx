import React from "react";
import { getUser, ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
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
  WithStyles
} from "@material-ui/core";
import AvatarChanger from "./AvatarChanger";

import { getUserSettings, updateUserSettings } from "../../../blockchain/UserService";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";

const styles = createStyles({
  avatarWrapper: {
    float: "left",
    marginTop: "10px",
    marginLeft: "10px",
    opacity: 0.8,
    "&:hover": {
      cursor: "pointer",
      opacity: 1
    }
  },
  description: {
    marginTop: "15px",
    marginLeft: "10px",
    width: "80%"
  },
  commitBtnWrapper: {
    textAlign: "center",
    marginTop: "5px"
  }
});

interface Props extends WithStyles<typeof styles> {}

interface SettingsState {
  avatar: string;
  editedAvatar: string;
  editAvatarOpen: boolean;
  description: string;
  updateSuccessOpen: boolean;
  updateErrorOpen: boolean;
  settingsUpdateStatus: string;
  user: ChromunityUser;
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
        updateSuccessOpen: false,
        updateErrorOpen: false,
        settingsUpdateStatus: "",
        user: getUser()
      };

      this.updateAvatar = this.updateAvatar.bind(this);
      this.commitAvatar = this.commitAvatar.bind(this);
      this.saveSettings = this.saveSettings.bind(this);
      this.toggleEditAvatarDialog = this.toggleEditAvatarDialog.bind(this);
      this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
      const user: ChromunityUser = this.state.user;
      if (user == null) {
        window.location.href = "/user/login";
      } else {
        getUserSettings(user).then((settings: UserSettings) => {
          this.setState({
            avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, user.name),
            description: settings.description
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
              <Dialog
                open={this.state.editAvatarOpen}
                aria-labelledby="form-dialog-title"
                fullWidth={true}
                maxWidth={"sm"}
              >
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
                <Avatar
                  src={this.state.avatar}
                  size={AVATAR_SIZE.LARGE}
                  onClick={() => this.toggleEditAvatarDialog()}
                />
              </div>
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
            </Card>
            <div className={this.props.classes.commitBtnWrapper}>
              <Button size="large" variant="contained" color="primary" onClick={() => this.saveSettings()}>
                Save
              </Button>
            </div>
          </Container>
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
        </div>
      );
    }

    handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
      this.setState({ description: event.target.value });
    }

    toggleEditAvatarDialog() {
      this.setState(prevState => ({
        editAvatarOpen: !prevState.editAvatarOpen
      }));
    }

    updateAvatar(updatedAvatar: string) {
      this.setState({ editedAvatar: updatedAvatar });
    }

    commitAvatar() {
      this.setState(prevState => ({
        avatar: prevState.editedAvatar,
        editAvatarOpen: false
      }));
    }

    saveSettings() {
      updateUserSettings(this.state.user, this.state.avatar, this.state.description)
        .then(() =>
          this.setState({
            settingsUpdateStatus: "Settings saved",
            updateSuccessOpen: true
          })
        )
        .catch(() =>
          this.setState({
            settingsUpdateStatus: "Error updating settings",
            updateErrorOpen: true
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

export default Settings;
