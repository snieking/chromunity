import React from 'react';
import {
    Badge,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import './ProfileCard.css';
import {
    Favorite,
    Inbox,
    ReplyAll,
    StarRate,
    SupervisedUserCircle,
    VoiceOverOff,
    VolumeOff,
    VolumeUp
} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {
    amIAFollowerOf,
    countUserFollowers,
    countUserFollowings,
    createFollowing,
    removeFollowing
} from "../../../blockchain/FollowingService";

import {
    countRepliesByUser,
    countReplyStarRatingForUser,
    countTopicsByUser,
    countTopicStarRatingForUser
} from "../../../blockchain/TopicService";

import {getUser, ifEmptyAvatarThenPlaceholder, isRepresentative} from "../../../util/user-util";
import {User} from "../../../types";
import {getMutedUsers, getUserSettingsCached, isRegistered, toggleUserMute} from "../../../blockchain/UserService";
import {NotFound} from "../../NotFound/NotFound";
import {suspendUser} from '../../../blockchain/RepresentativesService';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';

export interface ProfileCardProps {
    username: string
}

export interface ProfileCardState {
    registered: boolean;
    following: boolean;
    followers: number;
    userFollowings: number;
    countOfTopics: number;
    countOfReplies: number;
    topicStars: number;
    replyStars: number;
    avatar: string;
    description: string;
    suspendUserDialogOpen: boolean;
    muted: boolean;
    isRepresentative: boolean;
}

export class ProfileCard extends React.Component<ProfileCardProps, ProfileCardState> {

    constructor(props: ProfileCardProps) {
        super(props);

        this.state = {
            registered: true,
            following: false,
            followers: 0,
            userFollowings: 0,
            countOfTopics: 0,
            countOfReplies: 0,
            topicStars: 0,
            replyStars: 0,
            avatar: "",
            description: "",
            suspendUserDialogOpen: false,
            muted: false,
            isRepresentative: false
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
                    this.setState({registered: isRegistered});

                    if (isRegistered) {
                        const user: User = getUser();
                        if (user != null && user.name != null) {
                            amIAFollowerOf(getUser(), this.props.username).then(isAFollower => this.setState({following: isAFollower}));
                            getMutedUsers(user).then(users => this.setState({muted: users.includes(this.props.username)}));
                        }

                        getUserSettingsCached(this.props.username, 1440)
                            .then(settings => this.setState({
                                avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.username),
                                description: settings.description
                            }));
                        countUserFollowers(this.props.username).then(count => this.setState({followers: count}));
                        countUserFollowings(this.props.username).then(count => this.setState({userFollowings: count}));
                        countTopicsByUser(this.props.username).then(count => this.setState({countOfTopics: count}));
                        countRepliesByUser(this.props.username).then(count => this.setState({countOfReplies: count}));
                        countTopicStarRatingForUser(this.props.username).then(count => this.setState({topicStars: count}));
                        countReplyStarRatingForUser(this.props.username).then(count => this.setState({replyStars: count}));
                        isRepresentative().then(representative => this.setState({isRepresentative: representative}));
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
        if (this.state.isRepresentative) {
            return (
                <div style={{display: "inline"}}>
                    <IconButton onClick={() => this.setState({suspendUserDialogOpen: true})}>
                        <Tooltip title="Suspend user">
                            <VoiceOverOff fontSize="large" className="red-color"/>
                        </Tooltip>
                    </IconButton>
                </div>
            )
        }
    }

    suspendUser() {
        this.setState({suspendUserDialogOpen: false});
        suspendUser(getUser(), this.props.username);
    }

    handleSuspendUserClose() {
        if (this.state.suspendUserDialogOpen) {
            this.setState({suspendUserDialogOpen: false});
        }
    }

    toggleMuteUser() {
        const muted: boolean = !this.state.muted;
        this.setState({muted: muted}, () => toggleUserMute(getUser(), this.props.username, muted));
    }

    renderActions() {
        const user: User = getUser();
        if (user != null && this.props.username !== user.name) {
            return (
                <div className="float-right">
                    {this.renderUserSuspensionDialog()}
                    {this.renderRepresentativeActions()}
                    <IconButton onClick={() => this.toggleMuteUser()}>
                        {this.state.muted
                            ? <Tooltip title={"Unmute user"}>
                                <VolumeUp fontSize={"large"} className={"green-icon"}/>
                            </Tooltip>
                            : <Tooltip title="Mute user">
                                <VolumeOff fontSize={"large"} className={"purple-color"}/>
                            </Tooltip>
                        }
                    </IconButton>
                    {this.renderFollowButton()}
                </div>
            )
        }
    }

    renderUserSuspensionDialog() {
        return (
            <Dialog open={this.state.suspendUserDialogOpen} onClose={this.handleSuspendUserClose}
                    aria-labelledby="dialog-title">
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
                        {this.state.avatar !== "" ?
                            <img src={this.state.avatar} className="avatar" alt="Profile Avatar"/> : <div/>}
                        <div className="profile-desc">
                            <Typography variant="subtitle1" color="textSecondary" component="p" paragraph>
                                {this.state.description !== "" ? this.state.description : "I haven't written any description yet..."}
                            </Typography>
                        </div>
                        <div style={{float: "right", marginTop: "20px"}}>
                            <Badge badgeContent={this.state.userFollowings} showZero={true} color="primary">
                                <Tooltip title="Following users">
                                    <SupervisedUserCircle className="purple-color" style={{marginLeft: "0px"}}/>
                                </Tooltip>
                            </Badge>
                            <Badge badgeContent={this.state.topicStars + this.state.replyStars} showZero={true}
                                   color="primary">
                                <Tooltip title="Stars">
                                    <StarRate className="purple-color" style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                            <Badge badgeContent={this.state.countOfTopics} showZero={true} color="primary">
                                <Tooltip title="Topics">
                                    <Inbox className="purple-color" style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                            <Badge badgeContent={this.state.countOfReplies} showZero={true} color="primary"
                                   style={{marginRight: "15px"}}>
                                <Tooltip title="Replies">
                                    <ReplyAll className="purple-color" style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                        </div>
                    </Card>
                </div>
            )
        } else {
            return (
                <NotFound/>
            )
        }
    }

    renderFollowButton() {
        const user: User = getUser();
        if (user != null && user.name === this.props.username) {
            return (
                <Badge badgeContent={this.state.followers} showZero={true} color="primary">
                    <Tooltip title="Follow">
                        <Favorite fontSize="large" className='purple-color'/>
                    </Tooltip>
                </Badge>
            )
        } else {
            return (
                <IconButton onClick={() => this.toggleFollowing()}>
                    <Badge badgeContent={this.state.followers} showZero={true} color="primary">
                        <Tooltip title="Unfollow">
                            <Favorite fontSize="large"
                                      className={(this.state.following ? 'red-icon' : 'purple-color')}/>
                        </Tooltip>
                    </Badge>
                </IconButton>
            )
        }
    }

    render() {
        return (<div>{this.renderUserPage()}</div>);
    }

}
