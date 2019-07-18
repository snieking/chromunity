import React from 'react';
import { Link } from "react-router-dom";
import { Topic } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent, CardActionArea } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate, MoreHoriz } from '@material-ui/icons';
import './TopicOverviewCard.css';
import '../Topic.css'
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

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className="pink-typography"
                    to={"/u/" + this.props.topic.author}
                >
                    <Typography
                        gutterBottom
                        variant="body2"
                        component="span"
                        className="typography"
                    >
                        <span className="author-name">@{this.props.topic.author}</span>
                    </Typography>
                </Link>
                {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
            </div>
        );
    }

    renderCardContent() {
        return (
            <CardContent>
                <div className="left">
                    <div className="overview-rating">
                        <Badge
                            className="star-badge"
                            color="secondary"
                            badgeContent={this.state.stars}
                        >
                            <StarRate className={this.state.ratedByMe ? "yellow-icon" : ""} />
                        </Badge>
                    </div>
                </div>
                {this.renderAuthor()}
                <div className="topic-overview-details">
                    {this.renderTimeAgo(this.props.topic.timestamp)}
                    <Typography variant="body2" className='purple-typography' component="p">
                        {this.props.topic.title}
                    </Typography>
                </div>
            </CardContent >
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
