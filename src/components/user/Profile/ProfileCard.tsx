import React from 'react';
import { Card, Tooltip } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import './ProfileCard.css';
import { Favorite, VoiceOverOff } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {
    amIAFollowerOf,
    countUserFollowers, countUserFollowings,
    createFollowing,
    removeFollowing
} from "../../../blockchain/FollowingService";
import { getUser, ifEmptyAvatarThenPlaceholder, isRepresentative } from "../../../util/user-util";
import { User } from "../../../types";
import { isRegistered, getUserSettingsCached } from "../../../blockchain/UserService";
import { NotFound } from "../../NotFound/NotFound";
import { suspendUser } from '../../../blockchain/RepresentativesService';

export interface ProfileCardProps {
    username: string
}

export interface ProfileCardState {
    registered: boolean,
    following: boolean,
    followers: number,
    userFollowings: number,
    avatar: string,
    description: string
}

export class ProfileCard extends React.Component<ProfileCardProps, ProfileCardState> {

    constructor(props: ProfileCardProps) {
        super(props);

        this.state = {
            registered: true,
            following: false,
            followers: 0,
            userFollowings: 0,
            avatar: "",
            description: ""
        };

        this.renderUserPage = this.renderUserPage.bind(this);
        this.toggleFollowing = this.toggleFollowing.bind(this);
        this.renderFollowButton = this.renderFollowButton.bind(this);
    }

    componentDidMount(): void {
        isRegistered(this.props.username)
            .then(isRegistered => {
                this.setState({ registered: isRegistered });
                console.log("Registered: ", isRegistered);

                if (isRegistered) {
                    const user: User = getUser();
                    if (user.name != null) {
                        amIAFollowerOf(getUser(), this.props.username).then(isAFollower => this.setState({ following: isAFollower }));
                    }

                    getUserSettingsCached(this.props.username, 1440)
                        .then(settings => this.setState({
                            avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.username),
                            description: settings.description
                        }));
                    countUserFollowers(this.props.username).then(count => this.setState({ followers: count }));
                    countUserFollowings(this.props.username).then(count => this.setState({ userFollowings: count }));
                }
            }
            );


    }

    toggleFollowing() {
        if (this.state.following) {
            removeFollowing(getUser(), this.props.username);
            this.setState(prevState => ({
                following: false,
                followers: prevState.followers - 1,
                userFollowings: prevState.userFollowings
            }));
        } else {
            createFollowing(getUser(), this.props.username);
            this.setState(prevState => ({
                following: true,
                followers: prevState.followers + 1,
                userFollowings: prevState.userFollowings
            }));
        }
    }

    renderRepresentativeActions() {
        if (isRepresentative()) {
            return (
                <Tooltip title="Suspend user">
                    <IconButton onClick={() => suspendUser(getUser(), this.props.username)}>
                        <VoiceOverOff fontSize="large" className="red-color" />
                    </IconButton>
                </Tooltip>
            )
        }
    }

    renderFollowButton() {
        if (this.props.username !== getUser().name) {
            return (
                <div className="float-right">
                    {this.renderRepresentativeActions()}
                    <Tooltip title="Follow">
                        <IconButton onClick={() => this.toggleFollowing()}>
                            <Favorite fontSize="large" className={(this.state.following ? 'red-icon' : '')} />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }
    }

    renderUserPage() {
        if (this.state.registered) {
            return (
                <Card key={"user-card"} className="profile-card">
                    {this.state.avatar !== "" ? <img src={this.state.avatar} className="avatar" alt="Profile Avatar" /> : <div></div>}
                    <Typography gutterBottom variant="h6" component="h6"
                        className="typography pink-typography profile-title">
                        @{this.props.username}
                    </Typography>

                    <div className="profile-desc">
                        <Typography variant="body2" color="textSecondary" component="p">
                            {this.state.description}
                        </Typography>
                    </div>
                    {this.renderFollowButton()}
                    <div className="bottom-bar">
                        <Typography variant="body1" color="textSecondary" component="p" className="stats-bar">
                            <span className="stat"><b>{this.state.followers}</b></span> followers,
                            <span className="stat"> <b>{this.state.userFollowings}</b></span> following
                        </Typography>
                    </div>
                </Card>
            )
        } else {
            return (
                <NotFound />
            )
        }
    }

    render() {
        return (<div>{this.renderUserPage()}</div>);
    }

}
