import React from 'react';
import { Link } from "react-router-dom";
import { TopicReply, UserMeta, User } from '../../../types';
import { Card, Typography, IconButton, Badge, CardContent, TextField, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { timeAgoReadable } from '../../../util/util';
import { getUser, ifEmptyAvatarThenPlaceholder, isRepresentative, getCachedUserMeta } from '../../../util/user-util';
import { StarRate, Reply, Delete, Report } from '@material-ui/icons';
import { getUserSettingsCached } from '../../../blockchain/UserService';
import { removeTopicReply, removeReplyStarRating, giveReplyStarRating, getReplyStarRaters, getTopicSubReplies, createTopicSubReply } from '../../../blockchain/TopicService';

import './TopicReplyCard.css';
import '../Topic.css';
import { parseContent } from '../../../util/text-parsing';
import { reportReply } from '../../../blockchain/RepresentativesService';

interface Props {
    topicId: string;
    reply: TopicReply;
    indention: number;
    representatives: string[];
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
    userMeta: UserMeta;
    removeReplyDialogOpen: boolean;
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
            subReplies: [],
            userMeta: { name: "", suspended_until: Date.now() + 10000, times_suspended: 0 },
            removeReplyDialogOpen: false
        };

        this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
        this.sendReply = this.sendReply.bind(this);
    }

    render() {
        return (
            <div>
                <div className={this.props.reply.removed ? "removed" : ""}>
                    <Card
                        raised={true}
                        key={this.props.reply.id}
                        className='reply-card'
                        style={{ marginLeft: this.props.indention + "px" }}
                    >
                        {this.renderCardContent()}
                    </Card>
                </div>
                {this.state.subReplies.map(reply => <TopicReplyCard
                    key={"reply-" + reply.id}
                    reply={reply}
                    indention={this.props.indention + 10}
                    topicId={this.props.topicId}
                    representatives={this.props.representatives}
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
        getCachedUserMeta().then(meta => this.setState({ userMeta: meta }));
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

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className={"author-link"}
                    to={"/u/" + this.props.reply.author}
                    style={{
                        float: "right",
                        marginTop: "-17px",
                        marginBottom: "7px",
                        marginRight: "-16px",
                        backgroundColor: this.props.representatives.includes(this.props.reply.author) ? "darkorange" : "#FFAFC1"
                    }}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="span"
                        className="typography"
                    >
                        <span className="reply-author-name">@{this.props.reply.author}</span>
                    </Typography>
                </Link>
                <br />
                {this.state.avatar !== "" ? <img src={this.state.avatar} className="reply-author-avatar" alt="Profile Avatar" /> : <div></div>}
            </div>
        );
    }

    renderCardContent() {
        return (
            <CardContent>
                {this.renderAuthor()}
                <div className="reply-overview-details">
                    {this.renderTimeAgo(this.props.reply.timestamp)}
                    <Typography variant="body2" className='purple-typography' component="p">
                        <span dangerouslySetInnerHTML={{
                            __html: parseContent(this.props.reply.message)
                        }}
                            style={{ whiteSpace: "pre-line" }} />
                    </Typography>
                </div>
                <div className={"bottom-bar"}>
                <Tooltip title="Like">
                        <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                            <Badge
                                className="star-badge"
                                color="primary"
                                badgeContent={this.state.stars}
                            >
                                <StarRate className={this.state.ratedByMe ? "yellow-color" : "purple-color"} />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reply">
                        <IconButton
                            aria-label="Reply"
                            onClick={() => this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }))}
                        >
                            <Reply className={this.state.replyBoxOpen ? "pink-color" : "purple-color"} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Report">
                        <IconButton
                            aria-label="Report"
                            onClick={() => this.reportReply()}
                        >
                            <Report className="purple-color" />
                        </IconButton>
                    </Tooltip>
                    {this.renderAdminActions()}
                </div>
                <div>
                    {this.renderReplyBox()}
                </div>
            </CardContent>
        );
    }

    reportReply() {
        const user: User = getUser();

        if (user.name != null) {
            reportReply(user, this.props.topicId, this.props.reply.id);
            window.location.reload();
        } else {
            window.location.replace("/user/login");
        }
    }

    renderAdminActions() {
        if (isRepresentative() && !this.props.reply.removed) {
            return (
                <div style={{ display: "inline-block" }}>
                    <Tooltip title="Remove reply">
                        <IconButton aria-label="Remove reply"
                            onClick={() => this.setState({ removeReplyDialogOpen: true })}
                        >
                            <Delete className="red-color" />
                        </IconButton>
                    </Tooltip>

                    <Dialog open={this.state.removeReplyDialogOpen} onClose={() => this.setState({ removeReplyDialogOpen: false })} aria-labelledby="dialog-title">
                        <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                This action will remove the topic, which makes sure that no one will be able to read the initial message.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ removeReplyDialogOpen: false })} color="secondary">No</Button>
                            <Button onClick={() => this.setState({
                                removeReplyDialogOpen: false
                            }, () => removeTopicReply(getUser(), this.props.reply.id).then(() => window.location.reload()))} color="primary">
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )
        }
    }

    renderReplyBox() {
        if (this.state.replyBoxOpen && getUser().name == null) {
            window.location.replace("/user/login");
        } else if (this.state.replyBoxOpen && this.state.userMeta.suspended_until > Date.now()) {
            this.setState({ replyBoxOpen: false });
            window.alert("User account temporarily suspended");
        } else if (this.state.replyBoxOpen) {
            return (
                <div style={{ marginTop: "20px" }}>
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
                        variant="text"
                        style={{ marginRight: "5px" }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" color="primary" variant="text" onClick={() => this.sendReply()}>
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
            <Typography className='timestamp' variant='body2' component='span'>
                {timeAgoReadable(timestamp)}
            </Typography>
        )
    }
}

export default TopicReplyCard;
