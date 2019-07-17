import React from 'react';
import { Link } from "react-router-dom";
import { Topic } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent, CardActionArea } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate, MoreHoriz } from '@material-ui/icons';
import './TopicOverviewCard.css';
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { Redirect } from 'react-router';
import { getTopicStarRaters, removeTopicStarRating, giveTopicStarRating } from '../../../blockchain/TopicService';

interface Props {
    topic: Topic;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    redirectToFullCard: boolean;
    replyBoxOpen: boolean;
    replyMessage: string;
    isRepresentative: boolean;
    hideThreadConfirmDialogOpen: boolean;
    avatar: string;
}

class TopicOverviewCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            stars: 0,
            ratedByMe: false,
            redirectToFullCard: false,
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
        if (this.state.redirectToFullCard) {
            return (<Redirect to={"/t/" + this.props.topic.id} />);
        } else {
            return (
                <Card raised={true} key={this.props.topic.id} className='topic-card'>
                    <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
                        {this.renderCardContent()}
                    </CardActionArea>
                </Card>
            );
        }
    }

    componentDidMount() {
        getUserSettingsCached(this.props.topic.author, 1440)
            .then(settings => {
                this.setState({
                    avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.topic.author)
                });
            });
            getTopicStarRaters(this.props.topic.id).then(usersWhoStarRated => this.setState({ 
                stars: usersWhoStarRated.length,
                ratedByMe: usersWhoStarRated.includes(getUser().name)
            }));
    }

    renderReadMoreButton() {
        return (
            <Link to={'/t' + this.props.topic.id} >
                <IconButton aria-label="Read more">
                    <MoreHoriz />
                </IconButton>
            </Link>
        );
    }

    updateRatingStatus(parentId: string) {

    }

    toggleStarRate() {
        const id = this.props.topic.id;
        const name = getUser().name;
        
        if (name != null) {
            if (this.state.ratedByMe) {
                removeTopicStarRating(getUser(), id)
                    .then(() => this.setState(prevState => ({ ratedByMe: false, stars: prevState.stars - 1 })));
            } else {
                giveTopicStarRating(getUser(), id)
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
                        to={"/u/" + this.props.topic.author}
                    >
                        <span className="author-name">@{this.props.topic.author}</span>
                        {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
                    </Link>
                </Typography>
            </div>
        );
    }

    renderCardContent() {
        return (
            <CardContent>
                {this.renderTimeAgo(this.props.topic.timestamp)}
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
                    {this.props.topic.title}
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

export default TopicOverviewCard;
