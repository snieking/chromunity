import React from 'react';
import { Link } from "react-router-dom";
import { TopicReply } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate } from '@material-ui/icons';
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { removeReplyStarRating, giveReplyStarRating, getReplyStarRaters } from '../../../blockchain/TopicService';

interface Props {
    reply: TopicReply;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    replyBoxOpen: boolean;
    replyMessage: string;
    isRepresentative: boolean;
    hideThreadConfirmDialogOpen: boolean;
    avatar: string;
}

class TopicReplyCard extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            stars: 0,
            ratedByMe: false,
            replyBoxOpen: false,
            replyMessage: "",
            isRepresentative: false,
            hideThreadConfirmDialogOpen: false,
            avatar: ""
        };
    }

    static parseContent(message: string): string {
        return this.parseUsers(this.parseHashtags(message));
    }

    static parseHashtags(message: string): string {
        return message.replace(
            /(#)([a-z\d-]+)/gi,
            "<a  class='pink-typography' href='/tag/$2'>$1$2</a>"
        );
    }

    static parseUsers(message: string): string {
        return message.replace(
            /(@)([a-z\d-]+)/gi,
            "<a  class='purple-typography' href='/u/$2'><b>$1$2</b></a>"
        );
    }

    render() {
        return (
            <Card raised={true} key={this.props.reply.id} className='reply-card'>
                {this.renderCardContent()}
            </Card>
        );
    }

    componentDidMount() {
        getUserSettingsCached(this.props.reply.author, 1440)
            .then(settings => {
                this.setState({
                    avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author)
                });
            });
        getReplyStarRaters(this.props.reply.id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(getUser().name)
        }));
    }

    toggleStarRate() {
        const id = this.props.reply.id;
        const name = getUser().name;

        if (name != null) {
            if (this.state.ratedByMe) {
                removeReplyStarRating(getUser(), id)
                    .then(() => this.setState(prevState => ({ ratedByMe: false, stars: prevState.stars - 1 })));
            } else {
                giveReplyStarRating(getUser(), id)
                    .then(() => this.setState(prevState => ({ ratedByMe: true, stars: prevState.stars + 1 })))
            }
        } else {
            window.location.replace("/user/login");
        }
    }

    renderLoggedInRequiredActions() {
        if (getUser().name != null) {
            return (
                <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                    <Badge
                        className="star-badge"
                        color="secondary"
                        badgeContent={this.state.stars}
                    >
                        <StarRate className={this.state.ratedByMe ? "yellow-icon" : ""} />
                    </Badge>
                </IconButton>
            );
        }
    }

    renderAuthor() {
        return (
            <div className="right">
                <Typography
                    gutterBottom
                    variant="body2"
                    component="span"
                    className="typography"
                >
                    <Link
                        className="pink-typography"
                        to={"/u/" + this.props.reply.author}
                    >
                        <span className="author-name">@{this.props.reply.author}</span>
                        {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
                    </Link>
                </Typography>
            </div>
        );
    }

    renderCardContent() {
        return (
            <CardContent>
                {this.renderTimeAgo(this.props.reply.timestamp)}
                <div className="left">
                    <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                        <Badge
                            className="star-badge"
                            color="secondary"
                            badgeContent={this.state.stars}
                        >
                            <StarRate className={this.state.ratedByMe ? "yellow-icon" : ""} />
                        </Badge>
                    </IconButton>
                </div>
                {this.renderAuthor()}
                <Typography variant="body2" className='purple-typography' component="p">
                    {this.props.reply.message}
                </Typography>
            </CardContent>
        );
    }

    renderTimeAgo(timestamp: number) {
        return (
            <Typography className='topic-timestamp' variant='body2' component='span'>
                {timeAgoReadable(timestamp)}
            </Typography>
        )
    }
}

export default TopicReplyCard;
