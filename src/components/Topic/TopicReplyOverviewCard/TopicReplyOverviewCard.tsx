import React from 'react';
import { Link } from "react-router-dom";
import { TopicReply, User } from '../../../types';
import { Card, Typography, Badge, CardContent, CardActionArea } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate, StarBorder } from '@material-ui/icons';
import '../Topic.css'
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { Redirect } from 'react-router';
import { getReplyStarRaters } from '../../../blockchain/TopicService';
import ReactMarkdown from 'react-markdown';

interface Props {
    reply: TopicReply;
    isRepresentative: boolean;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    redirectToTopic: boolean;
    isRepresentative: boolean;
    avatar: string;
}

class TopicReplyOverviewCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            stars: 0,
            ratedByMe: false,
            redirectToTopic: false,
            isRepresentative: false,
            avatar: ""
        };
    }

    render() {
        if (this.state.redirectToTopic) {
            return (<Redirect to={"/t/" + this.props.reply.topic_id} />);
        } else {
            return (
                <div className={this.props.reply.removed ? "removed" : ""}>
                    <Card raised={true} key={this.props.reply.id} className='topic-card'>
                        <CardActionArea onClick={() => this.setState({ redirectToTopic: true })}>
                            {this.renderCardContent()}
                        </CardActionArea>
                    </Card>
                </div>
            );
        }
    }

    componentDidMount() {
        const user: User = getUser();
        getUserSettingsCached(this.props.reply.author, 1440)
            .then(settings => {
                this.setState({
                    avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.reply.author)
                });
            });
        getReplyStarRaters(this.props.reply.id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(user != null && user.name)
        }));
    }

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className={this.props.isRepresentative ? "rep-typography" : "pink-typography"}
                    to={"/u/" + this.props.reply.author}
                    style={{ marginBottom: "18px"}}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="span"
                        className="typography"
                    >
                        <span className="author-name">@{this.props.reply.author}</span>
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
                            color="primary"
                            badgeContent={this.state.stars}
                        >
                            {this.state.ratedByMe ? <StarRate className="yellow-color"/> : <StarBorder className="purple-color"/>}
                        </Badge>
                    </div>
                </div>
                {this.renderAuthor()}
                <div className="topic-overview-details">
                    {this.renderTimeAgo(this.props.reply.timestamp)}
                    <Typography variant="subtitle1" className='purple-typography' component="span" style={{ marginRight: "10px" }}>
                        <ReactMarkdown source={this.props.reply.message} disallowedTypes={["heading"]} />
                    </Typography>
                </div>
            </CardContent >
        );
    }

    renderTimeAgo(timestamp: number) {
        return (
            <Typography className='timestamp' variant='inherit' component='p'>
                {timeAgoReadable(timestamp)}
            </Typography>
        )
    }
}

export default TopicReplyOverviewCard;
