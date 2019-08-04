import React from 'react';
import {Link} from "react-router-dom";
import {TopicReply, User, UserMeta} from '../../../types';
import {
    Badge,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    LinearProgress,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core';
import {timeAgoReadable} from '../../../util/util';
import {getCachedUserMeta, getUser, ifEmptyAvatarThenPlaceholder, isRepresentative} from '../../../util/user-util';
import {Delete, Reply, Report, StarBorder, StarRate} from '@material-ui/icons';
import {getUserSettingsCached} from '../../../blockchain/UserService';
import {
    createTopicSubReply,
    getReplyStarRaters,
    getTopicSubReplies,
    giveReplyStarRating,
    modifyReply,
    removeReplyStarRating,
    removeTopicReply
} from '../../../blockchain/TopicService';

import './TopicReplyCard.css';
import '../Topic.css';
import ReactMarkdown from 'react-markdown';
import {reportReply} from '../../../blockchain/RepresentativesService';
import {EditMessageButton} from '../../buttons/EditMessageButton';

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
    isLoading: boolean;
}

const allowedEditTimeMillis: number = 300000;

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
            userMeta: {name: "", suspended_until: Date.now() + 10000, times_suspended: 0},
            removeReplyDialogOpen: false,
            isLoading: false
        };

        this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
        this.sendReply = this.sendReply.bind(this);
        this.editReplyMessage = this.editReplyMessage.bind(this);
    }

    render() {
        return (
            <div>
                <div className={this.props.reply.removed ? "removed" : ""}>
                    <Card
                        raised={true}
                        key={this.props.reply.id}
                        className='reply-card'
                        style={{marginLeft: this.props.indention + "px"}}
                    >
                        {this.state.isLoading ? <LinearProgress/> : <div></div>}
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
        getTopicSubReplies(this.props.reply.id).then(replies => this.setState({subReplies: replies}));
        getCachedUserMeta().then(meta => this.setState({userMeta: meta}));
        isRepresentative().then(isRepresentative => this.setState({isRepresentative: isRepresentative}));
    }

    toggleStarRate() {
        if (!this.state.isLoading) {
            this.setState({isLoading: true});
            const id = this.props.reply.id;
            const name = getUser().name;

            if (name != null) {
                if (this.state.ratedByMe) {
                    removeReplyStarRating(getUser(), id)
                        .then(() => this.setState(prevState => ({
                            ratedByMe: false,
                            stars: prevState.stars - 1,
                            isLoading: false
                        })))
                        .catch(() => this.setState({isLoading: false}));
                } else {
                    giveReplyStarRating(getUser(), id)
                        .then(() => this.setState(prevState => ({
                            ratedByMe: true,
                            stars: prevState.stars + 1,
                            isLoading: false
                        })))
                        .catch(() => this.setState({isLoading: false}));
                }
            } else {
                window.location.replace("/user/login");
            }
        }
    }

    renderAuthor() {
        return (
            <div className="right">
                <Link
                    className={"reply-author-link"}
                    to={"/u/" + this.props.reply.author}
                    style={{
                        float: "right",
                        marginTop: "-17px",
                        marginBottom: "7px",
                        marginRight: "-16px",
                        backgroundColor: this.props.representatives.includes(this.props.reply.author) ? "#CB8FE9" : "#FFAFC1"
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
                <br/>
                {this.state.avatar !== "" ?
                    <img src={this.state.avatar} className="reply-author-avatar" alt="Profile Avatar"/> : <div></div>}
            </div>
        );
    }

    renderCardContent() {
        const user: User = getUser();
        return (
            <CardContent>
                {this.renderAuthor()}
                <div>
                    {this.renderTimeAgo(this.props.reply.timestamp)}
                    <Typography variant="body2" className='purple-typography' component="p" style={{maxWidth: "100%"}}>
                        <ReactMarkdown source={this.props.reply.message} disallowedTypes={["heading"]}/>
                    </Typography>
                </div>
                <div className={"bottom-bar"}>
                    <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                        <Badge
                            className="star-badge"
                            color="primary"
                            badgeContent={this.state.stars}
                        >
                            <Tooltip title="Like">
                                {this.state.ratedByMe ? <StarRate className="yellow-color"/> :
                                    <StarBorder className="purple-color"/>}
                            </Tooltip>
                        </Badge>
                    </IconButton>
                    {this.props.reply.timestamp + allowedEditTimeMillis > Date.now() && user != null && this.props.reply.author === user.name
                        ? <EditMessageButton value={this.props.reply.message} submitFunction={this.editReplyMessage}/>
                        : null
                    }
                    <IconButton
                        aria-label="Reply"
                        onClick={() => this.setState(prevState => ({replyBoxOpen: !prevState.replyBoxOpen}))}
                    >
                        <Tooltip title="Reply">
                            <Reply className={this.state.replyBoxOpen ? "pink-color" : "purple-color"}/>
                        </Tooltip>
                    </IconButton>

                    <IconButton
                        aria-label="Report"
                        onClick={() => this.reportReply()}
                    >
                        <Tooltip title="Report">
                            <Report className="red-color"/>
                        </Tooltip>
                    </IconButton>
                    {this.renderAdminActions()}
                </div>
                <div>
                    {this.renderReplyBox()}
                </div>
            </CardContent>
        );
    }

    editReplyMessage(text: string) {
        modifyReply(getUser(), this.props.reply.id, text).then(() => window.location.reload());
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
        if (this.state.isRepresentative && !this.props.reply.removed) {
            return (
                <div style={{display: "inline-block"}}>
                    <IconButton aria-label="Remove reply"
                                onClick={() => this.setState({removeReplyDialogOpen: true})}
                    >
                        <Tooltip title="Remove reply">
                            <Delete className="red-color"/>
                        </Tooltip>
                    </IconButton>

                    <Dialog open={this.state.removeReplyDialogOpen}
                            onClose={() => this.setState({removeReplyDialogOpen: false})}
                            aria-labelledby="dialog-title">
                        <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                This action will remove the topic, which makes sure that no one will be able to read the
                                initial message.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({removeReplyDialogOpen: false})}
                                    color="secondary">No</Button>
                            <Button onClick={() => this.setState({
                                removeReplyDialogOpen: false
                            }, () => removeTopicReply(getUser(), this.props.reply.id).then(() => window.location.reload()))}
                                    color="primary">
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )
        }
    }

    renderReplyBox() {
        const user: User = getUser();
        if (this.state.replyBoxOpen && user == null) {
            window.location.replace("/user/login");
        } else if (this.state.replyBoxOpen && this.state.userMeta.suspended_until > Date.now()) {
            this.setState({replyBoxOpen: false});
            window.alert("User account temporarily suspended");
        } else if (this.state.replyBoxOpen) {
            return (
                <div style={{marginTop: "20px"}}>
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
                        onClick={() => this.setState({replyBoxOpen: false})}
                        color="secondary"
                        variant="text"
                        style={{marginRight: "5px"}}
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
        this.setState({replyMessage: event.target.value});
    }

    sendReply() {
        const message: string = this.state.replyMessage;
        this.setState({replyBoxOpen: false, replyMessage: ""});
        createTopicSubReply(getUser(), this.props.topicId, this.props.reply.id, message)
            .then(() => getTopicSubReplies(this.props.reply.id).then(replies => this.setState({subReplies: replies})));
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
