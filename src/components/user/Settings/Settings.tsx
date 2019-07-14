import React from 'react';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { User, UserSettings } from '../../../types';
import { Container, Paper, Button, Grid, Typography } from '@material-ui/core';
import AvatarChanger from './AvatarChanger/AvatarChanger';

import './Settings.css';
import { getUserSettings, updateUserSettings } from '../../../blockchain/UserService';

interface SettingsState {
    avatar: string
}

class Settings extends React.Component<{}, SettingsState> {

    constructor(props: any) {
        super(props);
        this.state = { avatar: "" };

        this.updateAvatar = this.updateAvatar.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
    }

    render() {
        return (
            <Container fixed maxWidth="md" className={"settings-container"}>
                <Grid container justify="center">
                    <Paper className="settings-paper">
                        <Typography gutterBottom variant="h4" component="h4"
                            className="typography purple-typography">
                            User settings
                        </Typography>
                        <hr/>
                        <Typography gutterBottom variant="h5" component="h5"
                            className="typography purple-typography">
                            Avatar
                        </Typography>
                        <AvatarChanger updateFunction={this.updateAvatar} previousPicture={this.state.avatar} />
                        <br />
                        {this.state.avatar !== "" ? <img src={this.state.avatar} alt="preview" /> : <div></div>}
                        <br />
                        <hr />
                        <Button variant="contained" color="primary" onClick={() => this.saveSettings()}>
                            Save
                    </Button>
                    </Paper>
                </Grid>
            </Container>
        )
    }

    componentDidMount() {
        const user: User = getUser();
        if (user == null) {
            window.location.replace("/login");
        } else {
            getUserSettings(user).then((settings: UserSettings) => {
                this.setState({ avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, user.name) });
            });
        }
    }

    updateAvatar(updatedAvatar: string) {
        this.setState({ avatar: updatedAvatar });
    }

    saveSettings() {
        updateUserSettings(getUser(), this.state.avatar);
    }

}

export default Settings;
