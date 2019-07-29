import React from "react";
import { Link } from "react-router-dom";
import { Container, Card, TextField, Button, CardActions, IconButton, CardContent, Typography, Badge, LinearProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { ReplyTopicButton } from "../../buttons/ReplyTopicButton";
import { removeTopic, getTopicById, removeTopicStarRating, giveTopicStarRating, getTopicStarRaters, unsubscribeFromTopic, subscribeToTopic, getTopicSubscribers, getTopicRepliesPriorToTimestamp, getTopicRepliesAfterTimestamp } from "../../../blockchain/TopicService";
import { Topic, User, TopicReply } from "../../../types";
import { getUser, ifEmptyAvatarThenPlaceholder, isRepresentative } from "../../../util/user-util";
import { timeAgoReadable } from "../../../util/util";
import { StarRate, SubdirectoryArrowRight, CheckCircle, CheckCircleOutline, Delete, Report } from "@material-ui/icons";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import TopicReplyCard from "../TopicReplyCard/TopicReplyCard";
import { parseContent } from "../../../util/text-parsing";
import LoadMoreButton from "../../buttons/LoadMoreButton";
import { reportTopic, getRepresentatives } from "../../../blockchain/RepresentativesService";


interface MatchParams {
    id: string
}

export interface FullTopicProps extends RouteComponentProps<MatchParams> {
    pathName: string;
}

export interface FullTopicState {
    topic: Topic;
    representatives: string[];
    avatar: string;
    stars: number;
    ratedByMe: boolean;
    subscribed: boolean;
    topicReplies: TopicReply[];
    replyBoxOpen: boolean;
    replyMessage: string;
    couldExistOlderReplies: boolean;
    isLoading: boolean;
    removeTopicDialogOpen: boolean;
}

const repliesPageSize: number = 25;

export class FullTopic extends React.Component<FullTopicProps, FullTopicState> {

    constructor(props: FullTopicProps) {
        super(props);

        const initialTopic: Topic = {
            id: "",
            title: "",
            author: "",
            message: "",
            timestamp: 0,
            last_modified: 0,
            removed: true
        };

        this.state = {
            topic: initialTopic,
            representatives: [],
            avatar: "",
            ratedByMe: false,
            subscribed: false,
            stars: 0,
            topicReplies: [],
            replyBoxOpen: false,
            replyMessage: "",
            couldExistOlderReplies: false,
            isLoading: true,
            removeTopicDialogOpen: false
        };

        this.retrieveLatestReplies = this.retrieveLatestReplies.bind(this);
        this.handleReplySubmit = this.handleReplySubmit.bind(this);
        this.retrieveOlderReplies = this.retrieveOlderReplies.bind(this);
    }

    componentDidMount(): void {
        const id = this.props.match.params.id;
        const user: User = getUser();

        getTopicById(id).then(topic => this.consumeTopicData(topic));
        this.retrieveLatestReplies();
        getTopicStarRaters(id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(user != null && user.name)
        }));
        getRepresentatives().then(representatives => this.setState({ representatives: representatives }));
        getTopicSubscribers(id).then(subscribers => this.setState({ subscribed: user != null && subscribers.includes(user.name) }));
    }

    consumeTopicData(topic: Topic): void {
        this.setState({ topic: topic });
        getUserSettingsCached(topic.author, 86400)
            .then(settings => this.setState({ avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, topic.author) }));
    }

    retrieveLatestReplies(): void {
        const topicId: string = this.props.match.params.id;
        this.setState({ isLoading: true });
        var replies: Promise<TopicReply[]>;
        if (this.state.topicReplies.length === 0) {
            replies = getTopicRepliesPriorToTimestamp(topicId, Date.now(), repliesPageSize);
        } else {
            replies = getTopicRepliesAfterTimestamp(topicId, this.state.topicReplies[0].timestamp, repliesPageSize);
        }

        replies.then(retrievedReplies => {
            if (retrievedReplies.length > 0) {
                this.setState(prevState => ({
                    topicReplies: Array.from(new Set(retrievedReplies.concat(prevState.topicReplies))),
                    isLoading: false,
                    couldExistOlderReplies: retrievedReplies.length >= repliesPageSize
                }))
            } else {
                this.setState({ isLoading: false });
            }
        }).catch(() => this.setState({ isLoading: false }));
    }

    retrieveOlderReplies() {
        if (this.state.topicReplies.length > 0) {
            this.setState({ isLoading: true });
            const oldestTimestamp: number = this.state.topicReplies[this.state.topicReplies.length - 1].timestamp;
            getTopicRepliesPriorToTimestamp(this.state.topic.id, oldestTimestamp - 1, repliesPageSize)
                .then(retrievedReplies => {
                    retrievedReplies.forEach(reply => console.log("Reply timestamp is: ", reply.timestamp));
                    if (retrievedReplies.length > 0) {
                        this.setState(prevState => ({
                            topicReplies: Array.from(new Set(prevState.topicReplies.concat(retrievedReplies))),
                            isLoading: false,
                            couldExistOlderReplies: retrievedReplies.length >= repliesPageSize
                        }));
                    } else {
                        this.setState({ isLoading: false, couldExistOlderReplies: false });
                    }
                });
        }
    }

    toggleStarRate() {
        const id: string = this.state.topic.id;
        const user: User = getUser();
        const name: string = user.name;

        if (name != null) {
            if (this.state.ratedByMe) {
                removeTopicStarRating(user, id)
                    .then(() => this.setState(prevState => ({ ratedByMe: false, stars: prevState.stars - 1 })));
            } else {
                giveTopicStarRating(user, id)
                    .then(() => this.setState(prevState => ({ ratedByMe: true, stars: prevState.stars + 1 })))
            }
        } else {
            window.location.replace("/user/login");
        }
    }

    toggleSubscription() {
        const id: string = this.state.topic.id;
        const user: User = getUser();
        const name: string = user.name;

        if (name != null) {
            if (this.state.subscribed) {
                unsubscribeFromTopic(user, id).then(() => this.setState(prevState => ({ subscribed: false })));
            } else {
                subscribeToTopic(user, id).then(() => this.setState(prevState => ({ subscribed: true })));
            }
        } else {
            window.location.replace("/user/login");
        }
    }

    renderTimeAgo() {
        return (
            <Typography className="timestamp right" variant="body2" component="span">
                {timeAgoReadable(this.state.topic.timestamp)}
            </Typography>
        )
    }

    renderAuthor() {
        return (
            <div className="right">
                {this.renderTimeAgo()}
                <br />
                <br />
                {this.state.avatar !== "" ? <img src={this.state.avatar} className="topic-author-avatar" alt="Profile Avatar" /> : <div></div>}
                <br />
                <Link
                    className={"author-link"}
                    to={"/u/" + this.state.topic.author}
                    style={{
                        float: "right",
                        marginTop: "7px",
                        marginRight: "-16px",
                        backgroundColor: this.state.representatives.includes(this.state.topic.author) ? "#CB8FE9" : "#FFAFC1"
                    }}
                >
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="span"
                        className="typography"
                    >
                        <span className="topic-author-name">@{this.state.topic.author}</span>
                    </Typography>
                </Link>
            </div>
        );
    }

    renderCardContent(content: string) {
        return (
            <CardContent>
                {this.renderAuthor()}
                <Typography
                    gutterBottom
                    variant="h6"
                    component="h6"
                    className="purple-typography"
                >
                    {this.state.topic.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    <span dangerouslySetInnerHTML={{
                        __html: parseContent(content)
                    }}
                        style={{ whiteSpace: "pre-line" }} />
                </Typography>
            </CardContent>
        );
    }

    renderCardActions() {
        return (
            <CardActions>
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
                <Tooltip title="Subscribe">
                    <IconButton aria-label="Subscribe" onClick={() => this.toggleSubscription()}>
                        {this.state.subscribed ? <CheckCircle className="blue-color" /> : <CheckCircleOutline className="purple-color" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Report">
                    <IconButton aria-label="Report" onClick={() => this.reportTopic()}>
                        <Report className="red-color" />
                    </IconButton>
                </Tooltip>
                {this.renderAdminActions()}
            </CardActions>
        );
    }

    reportTopic() {
        const user: User = getUser();

        if (user.name != null) {
            reportTopic(user, this.state.topic.id);
            window.location.reload();
        } else {
            window.location.replace("/user/login");
        }
    }

    renderAdminActions() {
        if (isRepresentative() && !this.state.topic.removed) {
            return (
                <div style={{ display: "inline-block" }}>
                    <Tooltip title="Remove topic">
                        <IconButton aria-label="Remove topic"
                            onClick={() => this.setState({ removeTopicDialogOpen: true })}
                        >
                            <Delete className="red-color" />
                        </IconButton>
                    </Tooltip>

                    <Dialog open={this.state.removeTopicDialogOpen} onClose={() => this.setState({ removeTopicDialogOpen: false })} aria-labelledby="dialog-title">
                        <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                This action will remove the topic, which makes sure that no one will be able to read the initial message.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ removeTopicDialogOpen: false })} color="secondary">No</Button>
                            <Button onClick={() => this.setState({
                                removeTopicDialogOpen: false
                            }, () => removeTopic(getUser(), this.props.match.params.id).then(() => window.location.reload()))} color="primary">
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            )
        }
    }

    renderTopic() {
        return (
            <div className={this.state.topic.removed ? "removed" : ""}>
                <Card raised={true} key={this.state.topic.id} className="topic-card">
                    {this.renderCardContent(this.state.topic.message)}
                    {this.renderCardActions()}
                </Card>
                {this.state.replyBoxOpen ? this.renderReplyBox() : <div />}
            </div>
        );
    }

    renderReplyBox() {
        if (this.state.replyBoxOpen) {
            return <Card key={"reply-box"}>{this.renderReplyForm()}</Card>;
        }
    }

    toggleReplyBox(): void {
        this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }));
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ replyMessage: event.target.value });
    }

    renderReplyForm() {
        return (
            <div className="reply-container">
                <Container>
                    <TextField
                        margin="normal"
                        id="message"
                        multiline
                        type="text"
                        fullWidth
                        value={this.state.replyMessage}
                        onChange={this.handleReplyMessageChange}
                    />
                    <Button type="button" onClick={() => this.toggleReplyBox()}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={() => this.handleReplySubmit()}>
                        Reply
                    </Button>
                    <br />
                    <br />
                </Container>
            </div>
        );
    }

    handleReplySubmit(): void {
        this.setState({ isLoading: true });
        this.retrieveLatestReplies();
        if (!this.state.subscribed) {
            subscribeToTopic(getUser(), this.state.topic.id).then(() => this.setState({ subscribed: true }));
        }
    }

    renderReplyButton() {
        return (
            <ReplyTopicButton submitFunction={this.handleReplySubmit}
                topicId={this.props.match.params.id}
                topicAuthor={this.state.topic.author}
            />
        )
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderReplies) {
            return (<LoadMoreButton onClick={this.retrieveOlderReplies} />)
        }
    }

    render() {
        return (
            <Container fixed>
                <br />
                {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                {this.renderTopic()}
                {this.state.topicReplies.length > 0
                    ? (<SubdirectoryArrowRight className="nav-button button-center" />)
                    : (<div />)}
                {this.state.topicReplies.map(reply => <TopicReplyCard
                    key={"reply-" + reply.id}
                    reply={reply}
                    indention={0}
                    topicId={this.state.topic.id}
                    representatives={this.state.representatives}
                />)}
                {this.renderLoadMoreButton()}
                {this.renderReplyButton()}
            </Container>
        )
    }
}
