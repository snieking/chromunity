import React from 'react';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { User, UserSettings } from '../../../types';
import { Container, Button, Dialog, DialogContent, DialogActions, DialogTitle, Card, TextField, Snackbar } from '@material-ui/core';
import AvatarChanger from './AvatarChanger/AvatarChanger';

import './Settings.css';
import { getUserSettings, updateUserSettings } from '../../../blockchain/UserService';
import { CustomSnackbarContentWrapper } from '../../utils/CustomSnackbar';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';

interface SettingsState {
    avatar: string;
    editedAvatar: string;
    editAvatarOpen: boolean;
    description: string;
    updateSuccessOpen: boolean;
    updateErrorOpen: boolean;
    settingsUpdateStatus: string;
}

class Settings extends React.Component<{}, SettingsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            avatar: "",
            editedAvatar: "",
            editAvatarOpen: false,
            description: "",
            updateSuccessOpen: false,
            updateErrorOpen: false,
            settingsUpdateStatus: ""
        };

        this.updateAvatar = this.updateAvatar.bind(this);
        this.commitAvatar = this.commitAvatar.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.toggleEditAvatarDialog = this.toggleEditAvatarDialog.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth="sm" className={"settings-container"}>
                    <ChromiaPageHeader text="Edit Settings" />
                    <Card key={"user-card"} className="profile-card">

                        <Dialog open={this.state.editAvatarOpen} aria-labelledby="form-dialog-title"
                            fullWidth={true} maxWidth={"sm"}>
                            <DialogTitle>Edit your avatar</DialogTitle>
                            <DialogContent>
                                <AvatarChanger updateFunction={this.updateAvatar} previousPicture={this.state.avatar} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => this.toggleEditAvatarDialog()} color="primary">
                                    Cancel
                                    </Button>
                                <Button onClick={() => this.commitAvatar()} color="primary">
                                    Send
                                    </Button>
                            </DialogActions>
                        </Dialog>
                        {this.state.avatar !== ""
                            ? <img src={this.state.avatar}
                                className="avatar-preview"
                                alt="preview"
                                onClick={() => this.toggleEditAvatarDialog()}
                            />
                            : <div></div>
                        }
                        <div className="description-wrapper">
                            <TextField
                                className="description-editor"
                                margin="dense"
                                id="description"
                                multiline
                                rows="2"
                                label="Profile description"
                                type="text"
                                variant="outlined"
                                onChange={this.handleDescriptionChange}
                                value={this.state.description}
                            />
                        </div>
                    </Card>
                    <div className="commit-button-wrapper">
                        <Button size="large" variant="contained" color="primary" onClick={() => this.saveSettings()}>
                            Save
                    </Button>
                    </div>
                </Container>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.updateSuccessOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="success"
                        message={this.state.settingsUpdateStatus}
                    />
                </Snackbar>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.updateErrorOpen}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <CustomSnackbarContentWrapper
                        variant="error"
                        message={this.state.settingsUpdateStatus}
                    />
                </Snackbar>
            </div>
        )
    }

    private handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ updateSuccessOpen: false, updateErrorOpen: false });
    }

    componentDidMount() {
        const user: User = getUser();
        if (user == null) {
            window.location.replace("/login");
        } else {
            getUserSettings(user).then((settings: UserSettings) => {
                this.setState({
                    avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, user.name),
                    description: settings.description
                });
            });
        }
    }

    handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ description: event.target.value });
    }

    toggleEditAvatarDialog() {
        this.setState(prevState => ({ editAvatarOpen: !prevState.editAvatarOpen }));
    }

    updateAvatar(updatedAvatar: string) {
        this.setState({ editedAvatar: updatedAvatar });
    }

    commitAvatar() {
        this.setState(prevState => ({ avatar: prevState.editedAvatar, editAvatarOpen: false }));
    }

    saveSettings() {
        updateUserSettings(getUser(), this.state.avatar, this.state.description)
            .then(() => this.setState({ settingsUpdateStatus: "Settings saved", updateSuccessOpen: true }))
            .catch(() => this.setState({ settingsUpdateStatus: "Error updating settings", updateErrorOpen: true }));
    }

}

export default Settings;
