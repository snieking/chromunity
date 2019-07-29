import React from 'react';
import { Link } from "react-router-dom";
import { TopicReply, User } from '../../../types';
import { Card, Typography, Badge, CardContent, CardActionArea } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate } from '@material-ui/icons';
import '../Topic.css'
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { Redirect } from 'react-router';
import { getReplyStarRaters } from '../../../blockchain/TopicService';

interface Props {
    reply: TopicReply;
    isRepresentative: boolean;
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
    tags: string[];
}

class TopicReplyOverviewCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            stars: 0,
            tags: [],
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
            return (<Redirect to={"/t/" + this.props.reply.topic_id} />);
        } else {
            return (
                <div className={this.props.reply.removed ? "removed" : ""}>
                    <Card raised={true} key={this.props.reply.id} className='topic-card'>
                        <CardActionArea onClick={() => this.setState({ redirectToFullCard: true })}>
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
                            <StarRate className={this.state.ratedByMe ? "yellow-color" : "purple-color"} />
                        </Badge>
                    </div>
                </div>
                {this.renderAuthor()}
                <div className="topic-overview-details">
                    {this.renderTimeAgo(this.props.reply.timestamp)}
                    <Typography variant="subtitle1" className='purple-typography' component="span" style={{ marginRight: "10px" }}>
                        {this.props.reply.message}
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
