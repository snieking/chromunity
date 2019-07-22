import React from 'react';
import { Link } from "react-router-dom";
import { TopicReply } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent, TextField, Button } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder } from '../../../util/user-util';
import { StarRate, Reply } from '@material-ui/icons';
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { removeReplyStarRating, giveReplyStarRating, getReplyStarRaters, getTopicSubReplies, createTopicSubReply } from '../../../blockchain/TopicService';

import './TopicReplyCard.css';
import '../Topic.css';

interface Props {
    topicId: string;
    reply: TopicReply;
    indention: number;
}

interface State {
    stars: number;
    ratedByMe: boolean;
    replyBoxOpen: boolean;
    replyMessage: string;
    isRepresentative: boolean;
    hideThreadConfirmDialogOpen: boolean;
    avatar: string;
    subReplies: TopicReply[];
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
            avatar: "",
            subReplies: []
        };

        this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
        this.sendReply = this.sendReply.bind(this);
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
            <div>
                <Card
                    raised={true}
                    key={this.props.reply.id}
                    className='reply-card'
                    style={{ marginLeft: this.props.indention + "px" }}
                >
                    {this.renderCardContent()}
                </Card>
                {this.state.subReplies.map(reply => <TopicReplyCard
                    key={"sub-reply" + reply.id}
                    reply={reply}
                    indention={this.props.indention + 15}
                    topicId={this.props.topicId}
                />)}
            </div>
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
        getTopicSubReplies(this.props.reply.id).then(replies => this.setState({ subReplies: replies }));
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

                <Link
                    className="pink-typography"
                    to={"/u/" + this.props.reply.author}
                >
                    <Typography
                        gutterBottom
                        variant="body2"
                        component="p"
                        className="typography"
                    ><span className="author-name">@{this.props.reply.author}</span>
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
                <div className="reply-overview-details">
                    {this.renderTimeAgo(this.props.reply.timestamp)}
                    <Typography variant="body2" className='purple-typography' component="p">
                        {this.props.reply.message}
                    </Typography>
                </div>
                <IconButton aria-label="Reply"
                    onClick={() => this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }))}
                    style={{ marginBottom: "-10px" }}
                >
                    <Reply className={this.state.replyBoxOpen ? "pink-typography" : ""} />
                </IconButton>
                <div>
                    {this.renderReplyBox()}
                </div>
            </CardContent>
        );
    }

    renderReplyBox() {
        if (getUser().name == null) {
            window.location.replace("/user/login");
        } else if (this.state.replyBoxOpen) {
            return (
                <div>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="message"
                        multiline
                        label="Reply"
                        type="text"
                        rows="3"
                        variant="outlined"
                        fullWidth
                        onChange={this.handleReplyMessageChange}
                        value={this.state.replyMessage}
                    />
                    <Button
                        onClick={() => this.setState({ replyBoxOpen: false })}
                        color="secondary"
                        variant="outlined"
                        style={{ marginRight: "5px" }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" color="primary" variant="outlined" onClick={() => this.sendReply()}>
                        Send
                    </Button>
                </div>
            )
        } else {
            return (<div></div>)
        }
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ replyMessage: event.target.value });
    }

    sendReply() {
        const message: string = this.state.replyMessage;
        this.setState({ replyBoxOpen: false, replyMessage: "" });
        createTopicSubReply(getUser(), this.props.topicId, this.props.reply.id, message)
            .then(() => getTopicSubReplies(this.props.reply.id).then(replies => this.setState({ subReplies: replies })));
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
