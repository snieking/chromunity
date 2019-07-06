import React from 'react';
import {Card} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import './ProfileCard.css';
import {Favorite} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {
    amIAFollowerOf,
    countUserFollowers, countUserFollowings,
    createFollowing,
    removeFollowing
} from "../../../blockchain/FollowingService";
import {getUser} from "../../../util/user-util";
import {User} from "../../../types";
import {isRegistered} from "../../../blockchain/UserService";
import {NotFound} from "../../NotFound/NotFound";

export interface ProfileCardProps {
    username: string
}

export interface ProfileCardState {
    registered: boolean,
    following: boolean,
    followers: number,
    userFollowings: number
}

export class ProfileCard extends React.Component<ProfileCardProps, ProfileCardState> {

    constructor(props: ProfileCardProps) {
        super(props);

        this.state = {
            registered: true,
            following: false,
            followers: 0,
            userFollowings: 0
        };

        this.renderUserPage = this.renderUserPage.bind(this);
        this.toggleFollowing = this.toggleFollowing.bind(this);
        this.renderFollowButton = this.renderFollowButton.bind(this);
    }

    componentDidMount(): void {
        isRegistered(this.props.username)
            .then(isRegistered => {
                    this.setState({registered: isRegistered});
                    console.log("Registered: ", isRegistered);

                    if (isRegistered) {
                        const user: User = getUser();
                        if (user.name != null) {
                            amIAFollowerOf(getUser(), this.props.username).then(isAFollower => this.setState({following: isAFollower}));
                        }

                        countUserFollowers(this.props.username).then(count => this.setState({followers: count}));
                        countUserFollowings(this.props.username).then(count => this.setState({userFollowings: count}));
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

    renderFollowButton() {
        if (this.props.username !== getUser().name) {
            return (
                <div className="top-right-corner">
                    <IconButton onClick={() => this.toggleFollowing()}>
                        <Favorite fontSize="large" className={(this.state.following ? 'red-icon' : '')}/>
                    </IconButton>
                </div>
            )
        }
    }

    renderUserPage() {
        if (this.state.registered) {
            return (
                <Card key={"user-card"} className="profile-card">
                    <img src={"https://i.pravatar.cc/128"} className="avatar" alt="Profile Avatar"/>
                    {this.renderFollowButton()}
                    <Typography gutterBottom variant="h6" component="h6"
                                className="typography pink-typography profile-title">
                        @{this.props.username}
                    </Typography>

                    <div className="profile-desc">
                        <Typography variant="body2" color="textSecondary" component="p">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </Typography>
                    </div>
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
                <NotFound/>
            )
        }
    }

    render() {
        return (<div>{this.renderUserPage()}</div>);
    }

}
