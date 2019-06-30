import React from "react";
import {Link} from 'react-router-dom'
import {Thread} from "../../types";
import {
    createSubThread,
    getSubThreadsByParentId,
    getThreadStarRating,
    removeStarRate,
    starRate
} from "../../blockchain/MessageService";
import {getUser} from "../../util/user-util";
import {Reply, StarRate} from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import {Redirect} from "react-router";
import {CardActionArea} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";

import './ThreadCard.css';

export interface ThreadCardProps {
    thread: Thread,
    truncated: boolean,
    isSubCard: boolean
}

export interface ThreadCardState {
    stars: number,
    ratedByMe: boolean,
    redirectToFullCard: boolean,
    replyBoxOpen: boolean,
    replyMessage: string,
    subThreads: Thread[]
}

export class ThreadCard extends React.Component<ThreadCardProps, ThreadCardState> {

    constructor(props: ThreadCardProps) {
        super(props);

        this.state = {
            stars: 0,
            ratedByMe: false,
            redirectToFullCard: false,
            replyBoxOpen: false,
            replyMessage: "",
            subThreads: []
        };

        this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
    }

    static isRatedByMe(upvoters: string[]): boolean {
        const username = getUser().name;
        return username !== null && upvoters.includes(username);
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({replyMessage: event.target.value})
    }

    handleReplySubmit(): void {
        createSubThread(getUser(), this.props.thread.id, this.state.replyMessage)
            .then(() => getSubThreadsByParentId(this.props.thread.id)
                .then(threads => this.setState({subThreads: threads})));
        this.setState({replyMessage: ""});
        this.toggleReplyBox();
    }

    componentDidMount(): void {
        const parentId: string = this.props.thread.id;

        if (parentId !== null) {
            getThreadStarRating(parentId).then(usersWhoRated => {
                console.log("Upvoters: ", usersWhoRated);
                const ratedByMe: boolean = ThreadCard.isRatedByMe(usersWhoRated);
                this.setState(prevState => ({
                    stars: usersWhoRated.length,
                    ratedByMe: ratedByMe
                }));
            });
        }
    }

    componentWillReceiveProps(nextProps: Readonly<ThreadCardProps>, nextContext: any): void {
        const parentId: string = nextProps.thread.id;

        if (parentId !== null) {
            getThreadStarRating(parentId).then(usersWhoRated => {
                console.log("Upvoters: ", usersWhoRated);
                const ratedByMe: boolean = ThreadCard.isRatedByMe(usersWhoRated);
                this.setState(prevState => ({
                    stars: usersWhoRated.length,
                    ratedByMe: ratedByMe
                }));
            });
            getSubThreadsByParentId(parentId)
                .then(threads => this.setState({subThreads: threads}));
        }
    }

    toggleStarRate() {
        const id = this.props.thread.id;
        console.log("Thread to rate star: ", id);
        const encryptedKey = getUser().encryptedKey;
        if (encryptedKey != null) {
            if (this.state.ratedByMe) {
                removeStarRate(getUser(), id)
                    .then(() => this.setState(prevState => ({stars: prevState.stars - 1, ratedByMe: false})))
                    .catch(() => this.setState(prevState => ({stars: prevState.stars, ratedByMe: true})));
            } else {
                starRate(getUser(), id)
                    .then(() => this.setState(prevState => ({stars: prevState.stars + 1, ratedByMe: true})))
                    .catch(() => this.setState(prevState => ({stars: prevState.stars, ratedByMe: false})));
            }
        }
    }

    getPostId(): string {
        return "/thread/" + this.props.thread.id;
    }

    doNavigate(): void {
        this.setState({redirectToFullCard: true});
    }

    renderTruncatedThreadCard() {
        return (
            <Card key={this.props.thread.id} className="thread-card">
                <CardActionArea className="thread-card" onClick={() => this.doNavigate()}>
                    {this.renderCardContent(this.props.thread.message)}
                </CardActionArea>
                {this.renderCardActions(false)}
            </Card>
        )
    }

    renderFullThreadCard() {
        return (
            <div>
                <Card key={this.props.thread.id} className="thread-card">
                    {this.renderCardContent(this.props.thread.message)}
                    {this.renderCardActions(!this.props.isSubCard)}
                </Card>
                {this.state.replyBoxOpen ? this.renderReplyBox() : <div></div>}
                {this.state.subThreads.map(thread => {
                    console.log("======== Subthread: ", thread);
                    return <ThreadCard key={"sub-thread-" + thread.id}
                                       thread={thread}
                                       truncated={false}
                                       isSubCard={true}
                    />
                })}
            </div>
        )
    }

    renderCardContent(content: string) {
        return (
            <CardContent>
                <Typography gutterBottom variant="h6" component="h6">
                    <Link to={"/u/" + this.props.thread.author}>@{this.props.thread.author}</Link>
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {content}
                </Typography>
            </CardContent>
        )
    }

    renderCardActions(renderReplyButton: boolean) {
        return (
            <CardActions>
                <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
                    <Badge className="star-badge" color="secondary" badgeContent={this.state.stars}>
                        <StarRate className={(this.state.ratedByMe ? 'yellow-icon' : '')}/>
                    </Badge>
                </IconButton>
                {this.renderReplyButton(renderReplyButton)}
            </CardActions>
        )
    }

    toggleReplyBox(): void {
        this.setState(prevState => ({replyBoxOpen: !prevState.replyBoxOpen}));
    }

    renderReplyButton(renderReplyButton: boolean) {
        if (renderReplyButton) {
            return (
                <IconButton aria-label="Like" onClick={() => this.toggleReplyBox()}>
                    <Reply className={(this.state.replyBoxOpen ? 'green-icon' : '')}/>
                </IconButton>
            )
        } else {
            return (<div></div>)
        }
    }

    renderReplyBox() {
        if (this.state.replyBoxOpen) {
            return (
                <Card key={"reply-box"}>
                    {this.renderReplyForm()}
                </Card>
            )
        }
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
                    <Button type="button" onClick={() => this.toggleReplyBox()}>Cancel</Button>
                    <Button type="submit" onClick={() => this.handleReplySubmit()}>Reply</Button>
                    <br/>
                    <br/>
                </Container>
            </div>
        )
    }

    render() {
        if (this.state.redirectToFullCard) {
            return <Redirect key={"red-" + this.props.thread.id} to={this.getPostId()}/>
        } else if (this.props.truncated) {
            return this.renderTruncatedThreadCard();
        } else {
            return this.renderFullThreadCard();
        }
    }

}
