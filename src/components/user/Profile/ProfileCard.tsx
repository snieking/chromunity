import React from 'react';
import { Card, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core";
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
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';

export interface ProfileCardProps {
    username: string
}

export interface ProfileCardState {
    registered: boolean,
    following: boolean,
    followers: number,
    userFollowings: number,
    avatar: string,
    description: string,
    suspendUserDialogOpen: boolean
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
            description: "",
            suspendUserDialogOpen: false
        };

        this.renderUserPage = this.renderUserPage.bind(this);
        this.toggleFollowing = this.toggleFollowing.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.suspendUser = this.suspendUser.bind(this);
        this.handleSuspendUserClose = this.handleSuspendUserClose.bind(this);
    }

    componentDidMount(): void {
        isRegistered(this.props.username)
            .then(isRegistered => {
                this.setState({ registered: isRegistered });

                if (isRegistered) {
                    const user: User = getUser();
                    if (user != null && user.name != null) {
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
                <div>
                    <Tooltip title="Suspend user">
                        <IconButton onClick={() => this.setState({ suspendUserDialogOpen: true })}>
                            <VoiceOverOff fontSize="large" className="red-color" />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }
    }

    suspendUser() {
        this.setState({ suspendUserDialogOpen: false });
        suspendUser(getUser(), this.props.username);
    }

    handleSuspendUserClose() {
        if (this.state.suspendUserDialogOpen) {
            this.setState({ suspendUserDialogOpen: false });
        }
    }

    renderActions() {
        const user: User = getUser();
        if (user != null && this.props.username !== user.name) {
            return (
                <div className="float-right">
                    {this.renderUserSuspensionDialog()}
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

    renderUserSuspensionDialog() {
        return (
            <Dialog open={this.state.suspendUserDialogOpen} onClose={this.handleSuspendUserClose} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action will suspend the user, temporarily preventing them from posting anything.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleSuspendUserClose} color="secondary">No</Button>
                    <Button onClick={this.suspendUser} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>
        )
    }

    renderUserPage() {
        if (this.state.registered) {
            return (
                <div>
                    <ChromiaPageHeader text={"@" + this.props.username}/>
                    <Card key={"user-card"} className="profile-card">
                        {this.renderActions()}
                        {this.state.avatar !== "" ? <img src={this.state.avatar} className="avatar" alt="Profile Avatar" /> : <div></div>}
                        <div className="top-bar">
                            <Typography variant="body1" color="textSecondary" component="p" className="stats-bar">
                                <span className="stat"><b>{this.state.followers}</b></span> followers,
                                <span className="stat"> <b>{this.state.userFollowings}</b></span> following
                            </Typography>
                        </div>
                        <div className="profile-desc">
                            <Typography variant="body2" color="textSecondary" component="p" paragraph>
                                {this.state.description}
                            </Typography>
                        </div>
                    </Card>
                </div>
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
