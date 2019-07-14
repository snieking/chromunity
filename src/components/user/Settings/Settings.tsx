import React from 'react';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { User, UserSettings } from '../../../types';
import { Container, Button, Dialog, DialogContent, DialogActions, DialogTitle, Card, TextField } from '@material-ui/core';
import AvatarChanger from './AvatarChanger/AvatarChanger';

import './Settings.css';
import { getUserSettings, updateUserSettings } from '../../../blockchain/UserService';

interface SettingsState {
    avatar: string,
    editedAvatar: string,
    editAvatarOpen: boolean,
    description: string
}

class Settings extends React.Component<{}, SettingsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            avatar: "",
            editedAvatar: "",
            editAvatarOpen: false,
            description: ""
        };

        this.updateAvatar = this.updateAvatar.bind(this);
        this.commitAvatar = this.commitAvatar.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.toggleEditAvatarDialog = this.toggleEditAvatarDialog.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    }

    render() {
        return (
            <Container fixed maxWidth="sm" className={"settings-container"}>
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
                        <label className="description-label">Description</label>
                        <TextField
                            className="description-editor"
                            margin="dense"
                            id="description"
                            multiline
                            type="text"
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
        )
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
        updateUserSettings(getUser(), this.state.avatar, this.state.description);
    }

}

export default Settings;
