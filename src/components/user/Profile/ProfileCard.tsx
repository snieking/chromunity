import React from 'react';
import {Card} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import './ProfileCard.css';
import {GroupAdd} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";

export interface ProfileCardProps {
    username: string
}

export interface ProfileCardState {

}

export class ProfileCard extends React.Component<ProfileCardProps, ProfileCardState> {

    constructor(props: ProfileCardProps) {
        super(props);
    }

    render() {
        return (
            <Card key={"user-card"} className="profile-card">
                <img src={"https://i.pravatar.cc/128"} className="avatar" alt="Profile Avatar"/>
                <div className="top-right-corner">
                    <IconButton>
                        <GroupAdd fontSize="large"/>
                    </IconButton>
                </div>
                <Typography gutterBottom variant="h6" component="h6" className="typography pink-typography">
                    @{this.props.username}
                </Typography>

                <div className="profile-desc">
                    <Typography variant="body2" color="textSecondary" component="p">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                        ut aliquip ex ea commodo consequat.
                    </Typography>
                </div>
                <Typography variant="body2" color="textSecondary" component="p" className="stats-bar">
                    <span className="stat"><b>0</b></span> followers, <span
                    className="stat"><b>0</b></span> following
                </Typography>
            </Card>
        );
    }
}
