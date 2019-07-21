import React from "react";
import { Link } from "react-router-dom";
import { Container, Card, TextField, Button, CardActions, IconButton, CardContent, Typography, Badge, LinearProgress } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { ReplyTopicButton } from "../../buttons/ReplyTopicButton";
import { getTopicById, removeTopicStarRating, giveTopicStarRating, getTopicStarRaters, unsubscribeFromTopic, subscribeToTopic, getTopicSubscribers, getTopicRepliesPriorToTimestamp } from "../../../blockchain/TopicService";
import { Topic, User, TopicReply } from "../../../types";
import { getUser, ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import { timeAgoReadable } from "../../../util/util";
import { StarRate, SubdirectoryArrowRight, Archive } from "@material-ui/icons";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import TopicReplyCard from "../TopicReplyCard/TopicReplyCard";
import { parseContent } from "../../../util/text-parsing";
import LoadMoreButton from "../../buttons/LoadMoreButton";


interface MatchParams {
    id: string
}

export interface FullTopicProps extends RouteComponentProps<MatchParams> {
    pathName: string;
}

export interface FullTopicState {
    topic: Topic;
    avatar: string;
    stars: number;
    ratedByMe: boolean;
    subscribed: boolean;
    topicReplies: TopicReply[];
    replyBoxOpen: boolean;
    replyMessage: string;
    couldExistOlderReplies: boolean;
    isLoading: boolean;
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
            lastModified: 0
        };

        this.state = {
            topic: initialTopic,
            avatar: "",
            ratedByMe: false,
            subscribed: false,
            stars: 0,
            topicReplies: [],
            replyBoxOpen: false,
            replyMessage: "",
            couldExistOlderReplies: false,
            isLoading: true
        };

        this.retrieveLatestReplies = this.retrieveLatestReplies.bind(this);
        this.handleReplySubmit = this.handleReplySubmit.bind(this);
        this.retrieveOlderReplies = this.retrieveOlderReplies.bind(this);
    }

    componentDidMount(): void {
        const id = this.props.match.params.id;
        getTopicById(id).then(topic => this.consumeTopicData(topic));
        this.retrieveLatestReplies();
        getTopicStarRaters(id).then(usersWhoStarRated => this.setState({
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(getUser().name)
        }));
        getTopicSubscribers(id).then(subscribers => this.setState({ subscribed: subscribers.includes(getUser().name) }));
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
            replies = getTopicRepliesPriorToTimestamp(topicId, this.state.topicReplies[0].timestamp, repliesPageSize);
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
        })
    }

    retrieveOlderReplies() {
        if (this.state.topicReplies.length > 0) {
            this.setState({ isLoading: true });
            const oldestTimestamp: number = this.state.topicReplies[this.state.topicReplies.length - 1].timestamp;
            console.log("Oldest timestamp is: ", oldestTimestamp);
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
            <Typography className="topic-timestamp right" variant="body2" component="span">
                {timeAgoReadable(this.state.topic.timestamp)}
            </Typography>
        )
    }

    renderAuthor() {
        return (
            <div className="right">
                {this.renderTimeAgo()}
                <Typography
                    gutterBottom
                    variant="h6"
                    component="h6"
                    className="typography"
                >
                    <Link
                        className="pink-typography"
                        to={"/u/" + this.state.topic.author}
                    >
                        @{this.state.topic.author}
                    </Link>
                </Typography>
                {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
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

    renderCardActions(renderReadMoreButton: boolean) {
        return (
            <CardActions>
                <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                    <Badge
                        className="star-badge"
                        color="primary"
                        badgeContent={this.state.stars}
                    >
                        <StarRate className={this.state.ratedByMe ? "yellow-icon" : ""} />
                    </Badge>
                </IconButton>
                <IconButton aria-label="Subscribe" onClick={() => this.toggleSubscription()}>
                    <Archive className={this.state.subscribed ? "green-icon" : ""} />
                </IconButton>
            </CardActions>
        );
    }

    renderTopic() {
        return (
            <div>
                <Card raised={true} key={this.state.topic.id} className="topic-card">
                    {this.renderCardContent(this.state.topic.message)}
                    {this.renderCardActions(false)}
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
            return (<LoadMoreButton onClick={this.retrieveOlderReplies}/>)
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
                {this.state.topicReplies.map(reply => <TopicReplyCard key={"reply-" + reply.id} reply={reply} />)}
                {this.renderLoadMoreButton()}
                {this.renderReplyButton()}
            </Container>
        )
    }
}
