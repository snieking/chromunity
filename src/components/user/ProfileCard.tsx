import React from 'react';
import {
    Badge,
    Button,
    Card,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    withStyles,
    WithStyles
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

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
} from "../../blockchain/FollowingService";

import {
    countRepliesByUser,
    countReplyStarRatingForUser,
    countTopicsByUser,
    countTopicStarRatingForUser
} from "../../blockchain/TopicService";

import {getUser, ifEmptyAvatarThenPlaceholder, isRepresentative} from "../../util/user-util";
import {User} from "../../types";
import {getMutedUsers, getUserSettingsCached, isRegistered, toggleUserMute} from "../../blockchain/UserService";
import {suspendUser} from '../../blockchain/RepresentativesService';
import ChromiaPageHeader from '../common/ChromiaPageHeader';
import {COLOR_RED, COLOR_STEEL_BLUE} from "../../theme";
import Avatar, {AVATAR_SIZE} from "../common/Avatar";
import {NotFound} from "../static/NotFound";

const styles = createStyles({
    iconRed: {
        color: COLOR_RED
    },
    iconBlue: {
        color: COLOR_STEEL_BLUE
    },
    contentWrapper: {
        float: "left",
        marginTop: "10px",
        marginLeft: "10px",
        marginRight: "10px"
    },
    description: {
        marginRight: "12px",
        marginTop: "5px"
    },
    bottomBar: {
        marginBottom: "5px"
    }
});

export interface ProfileCardProps extends WithStyles<typeof styles> {
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

const ProfileCard = withStyles(styles)(
    class extends React.Component<ProfileCardProps, ProfileCardState> {

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
                                getMutedUsers(user).then(users => this.setState({
                                    muted: users.includes(this.props.username.toLocaleLowerCase())
                                }));
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
                                <VoiceOverOff fontSize="large" className={this.props.classes.iconRed}/>
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
                    <div style={{float: "right"}}>
                        {this.renderUserSuspensionDialog()}
                        {this.renderRepresentativeActions()}
                        <IconButton onClick={() => this.toggleMuteUser()}>
                            {this.state.muted
                                ? <Tooltip title={"Unmute user"}>
                                    <VolumeUp fontSize={"large"} className={this.props.classes.iconBlue}/>
                                </Tooltip>
                                : <Tooltip title="Mute user">
                                    <VolumeOff fontSize={"large"}/>
                                </Tooltip>
                            }
                        </IconButton>
                        {this.renderFollowButton()}
                        <br/>
                        <div className={this.props.classes.bottomBar}>
                            <Badge badgeContent={this.state.userFollowings} showZero={true} color="primary">
                                <Tooltip title="Following users">
                                    <SupervisedUserCircle/>
                                </Tooltip>
                            </Badge>
                            <Badge badgeContent={this.state.topicStars + this.state.replyStars} showZero={true}
                                   color="primary">
                                <Tooltip title="Stars">
                                    <StarRate style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                            <StarRate style={{marginLeft: "10px"}}/>
                            <Badge badgeContent={this.state.countOfTopics} showZero={true} color="primary">
                                <Tooltip title="Topics">
                                    <Inbox style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                            <Badge badgeContent={this.state.countOfReplies} showZero={true} color="primary"
                                   style={{marginRight: "15px"}}>
                                <Tooltip title="Replies">
                                    <ReplyAll style={{marginLeft: "10px"}}/>
                                </Tooltip>
                            </Badge>
                        </div>
                    </div>
                )
            }
        }

        renderUserSuspensionDialog() {
            return (
                <Dialog
                    open={this.state.suspendUserDialogOpen}
                    onClose={this.handleSuspendUserClose}
                    aria-labelledby="dialog-title"
                >
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
                        <Card key={"user-card"}>
                            {this.renderActions()}
                            <div className={this.props.classes.contentWrapper}>
                                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE}/>
                            </div>
                            <Typography variant="subtitle1" component="p" className={this.props.classes.description}>
                                {this.state.description !== "" ? this.state.description : "I haven't written any description yet..."}
                            </Typography>
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
                        <Tooltip title="Followers">
                            <Favorite fontSize="large"/>
                        </Tooltip>
                    </Badge>
                )
            } else {
                return (
                    <IconButton onClick={() => this.toggleFollowing()}>
                        <Badge badgeContent={this.state.followers} showZero={true} color="primary">
                            <Tooltip title={this.state.following ? "Unfollow" : "Follow"}>
                                <Favorite fontSize="large"
                                          className={(this.state.following ? this.props.classes.iconRed : '')}/>
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
);

export default ProfileCard;