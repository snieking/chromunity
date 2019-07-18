import React from "react";
import { Link } from "react-router-dom";
import { Container, Card, TextField, Button, CardActions, IconButton, CardContent, Typography, Badge } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { ReplyTopicButton } from "../../buttons/ReplyTopicButton";
import { getTopicById, removeTopicStarRating, giveTopicStarRating, getTopicStarRaters, getTopicReplies } from "../../../blockchain/TopicService";
import { Topic, User, TopicReply } from "../../../types";
import { getUser, ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import { timeAgoReadable } from "../../../util/util";
import { StarRate, SubdirectoryArrowRight } from "@material-ui/icons";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import TopicReplyCard from "../TopicReplyCard/TopicReplyCard";


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
    topicReplies: TopicReply[];
    replyBoxOpen: boolean;
    replyMessage: string;
}

export class FullTopic extends React.Component<FullTopicProps, FullTopicState> {

    constructor(props: FullTopicProps) {
        super(props);

        const initialTopic: Topic = {
            id: "",
            title: "",
            author: "",
            message: "",
            timestamp: 0
        };

        this.state = {
            topic: initialTopic,
            avatar: "",
            ratedByMe: false,
            stars: 0,
            topicReplies: [],
            replyBoxOpen: false,
            replyMessage: ""
        };

        this.retrieveReplies = this.retrieveReplies.bind(this);

    }

    componentDidMount(): void {
        const id = this.props.match.params.id;
        getTopicById(id).then(topic => this.consumeTopicData(topic));
        this.retrieveReplies();
    }

    consumeTopicData(topic: Topic): void {
        this.setState({ topic: topic });
        getUserSettingsCached(topic.author, 86400)
            .then(settings => this.setState({ avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, topic.author) }));
        getTopicStarRaters(topic.id).then(usersWhoStarRated => this.setState({ 
            stars: usersWhoStarRated.length,
            ratedByMe: usersWhoStarRated.includes(getUser().name)
        }));
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

    retrieveReplies(): void {
        getTopicReplies(this.props.match.params.id).then(replies => {
            this.setState({ topicReplies: replies });
        });
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
                        __html: FullTopic.parseContent(content)
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
                        color="secondary"
                        badgeContent={this.state.stars}
                    >
                        <StarRate className={this.state.ratedByMe ? "yellow-icon" : ""} />
                    </Badge>
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

    handleReplySubmit(): void {
        this.setState({ replyMessage: "" });
        this.toggleReplyBox();
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

    renderReplyButton() {
        return (
            <ReplyTopicButton updateFunction={this.retrieveReplies}
                topicId={this.props.match.params.id}
                topicAuthor={this.state.topic.author}
            />
        )
    }

    render() {
        return (
            <Container fixed>
                <br />
                {this.renderTopic()}
                {this.state.topicReplies.length > 0
                    ? (<SubdirectoryArrowRight className="nav-button button-center" />)
                    : (<div />)}
                {this.state.topicReplies.map(reply => <TopicReplyCard key={"reply-" + reply.id} reply={reply}/>)}
                {this.renderReplyButton()}
            </Container>
        )
    }
}
