import React from "react";
import { Link } from "react-router-dom";
import { Thread } from "../../types";
import {
    createSubThread,
    getSubThreadsByParentId,
    getThreadStarRating,
    removeStarRate,
    starRate
} from "../../blockchain/MessageService";
import { getUser, isRepresentative, ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import {
    DeleteSweep,
    MoreHoriz,
    StarRate,
    SubdirectoryArrowRight
} from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import { Redirect } from "react-router";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";

import "./ThreadCard.css";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@material-ui/core";
import { setThreadNotVisible } from "../../blockchain/RepresentativesService";
import { timeAgoReadable, needsToBeSliced } from "../../util/util";
import { getUserForumAvatar } from "../../blockchain/UserService";

export interface ThreadCardProps {
    thread: Thread;
    truncated: boolean;
    isSubCard: boolean;
    isUserPage: boolean;
}

export interface ThreadCardState {
    stars: number;
    ratedByMe: boolean;
    redirectToFullCard: boolean;
    replyBoxOpen: boolean;
    replyMessage: string;
    subThreads: Thread[];
    isRepresentative: boolean;
    hideThreadConfirmDialogOpen: boolean;
    avatar: string;
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
            subThreads: [],
            isRepresentative: false,
            hideThreadConfirmDialogOpen: false,
            avatar: ""
        };

        this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
        this.closeHideThreadConfirmDialog = this.closeHideThreadConfirmDialog.bind(this);
        this.hideThread = this.hideThread.bind(this);
        this.toggleHideConfirmation = this.toggleHideConfirmation.bind(this);
        this.updateRatingStatus = this.updateRatingStatus.bind(this);
    }

    static isRatedByMe(upvoters: string[]): boolean {
        const username = getUser().name;
        return username !== null && upvoters.includes(username);
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

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ replyMessage: event.target.value });
    }

    handleReplySubmit(): void {
        createSubThread(getUser(), this.props.thread.id, this.props.thread.author, this.state.replyMessage)
            .then(() => getSubThreadsByParentId(this.props.thread.id)
                .then(threads => this.setState({ subThreads: threads })));
        this.setState({ replyMessage: "" });
        this.toggleReplyBox();
    }

    componentDidMount(): void {
        const parentId: string = this.props.thread.id;

        if (parentId !== null) {
            this.updateRatingStatus(parentId);
        }

        isRepresentative().then(bool => this.setState({ isRepresentative: bool }));
        getUserForumAvatar(this.props.thread.author, 1440).then(avatar => {
            this.setState({ avatar: ifEmptyAvatarThenPlaceholder(avatar, this.props.thread.author) });
        })
    }

    componentWillReceiveProps(nextProps: Readonly<ThreadCardProps>, nextContext: any): void {
        const parentId: string = nextProps.thread.id;

        if (parentId !== null) {
            this.updateRatingStatus(parentId);
            getSubThreadsByParentId(parentId).then(threads =>
                this.setState({ subThreads: threads })
            );
        }
    }

    updateRatingStatus(parentId: string) {
        getThreadStarRating(parentId).then(usersWhoRated => {
            const ratedByMe: boolean = ThreadCard.isRatedByMe(usersWhoRated);
            this.setState({
                stars: usersWhoRated.length,
                ratedByMe: ratedByMe
            });
        });
    }

    toggleStarRate() {
        const id = this.props.thread.id;
        const name = getUser().name;
        if (name != null) {
            if (this.state.ratedByMe) {
                removeStarRate(getUser(), id)
                    .then(() =>
                        this.setState(prevState => ({
                            stars: prevState.stars - 1,
                            ratedByMe: false
                        }))
                    )
                    .catch(() =>
                        this.setState(prevState => ({
                            stars: prevState.stars,
                            ratedByMe: true
                        }))
                    );
            } else {
                starRate(getUser(), id)
                    .then(() =>
                        this.setState(prevState => ({
                            stars: prevState.stars + 1,
                            ratedByMe: true
                        }))
                    )
                    .catch(() =>
                        this.setState(prevState => ({
                            stars: prevState.stars,
                            ratedByMe: false
                        }))
                    );
            }
        }
    }

    getRootPostId(): string {
        const threadId = this.props.thread.rootThreadId === ""
            ? this.props.thread.id
            : this.props.thread.rootThreadId;
        return "/thread/" + threadId;
    }

    renderTruncatedThreadCard() {
        return (
            <Card raised={true} key={this.props.thread.id} className="thread-card">
                {this.renderTimeAgo(this.props.thread.timestamp)}
                {
                    needsToBeSliced(this.props.thread.message)
                        ? this.renderCardContent(this.props.thread.message.slice(0, 300) + "...")
                        : this.renderCardContent(this.props.thread.message)
                }
                {this.renderCardActions(true)}
            </Card>
        );
    }

    renderFullThreadCard() {
        return (
            <div>
                <Card raised={true} key={this.props.thread.id} className="thread-card">
                    {this.renderTimeAgo(this.props.thread.timestamp)}
                    {this.renderCardContent(this.props.thread.message)}
                    {this.renderCardActions(false)}
                </Card>
                {this.state.replyBoxOpen ? this.renderReplyBox() : <div />}
                {this.state.subThreads.length > 0
                    ? (<SubdirectoryArrowRight className="nav-button button-center" />)
                    : (<div />)}
                {this.state.subThreads.map(thread => {
                    return (
                        <ThreadCard
                            key={"sub-thread-" + thread.id}
                            thread={thread}
                            truncated={false}
                            isSubCard={true}
                            isUserPage={this.props.isUserPage}
                        />
                    );
                })}
            </div>
        );
    }

    renderAuthor() {
        if (!this.props.isUserPage) {
            return (
                <div>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="h6"
                        className="typography"
                    >
                        <Link
                            className="pink-typography"
                            to={"/u/" + this.props.thread.author}
                        >
                            @{this.props.thread.author}
                        </Link>
                    </Typography>
                    {this.state.avatar !== "" ? <img src={this.state.avatar} className="author-avatar" alt="Profile Avatar" /> : <div></div>}
                </div>
            );
        }
    }

    toggleHideConfirmation() {
        this.setState({ hideThreadConfirmDialogOpen: true });
    }

    renderCardContent(content: string) {
        return (
            <CardContent>
                {this.renderAuthor()}
                <Typography variant="body2" color="textSecondary" component="p">
                    <span dangerouslySetInnerHTML={{
                        __html: ThreadCard.parseContent(content)
                    }} />
                </Typography>
            </CardContent>
        );
    }

    closeHideThreadConfirmDialog() {
        this.setState({ hideThreadConfirmDialogOpen: false });
    }

    hideThread() {
        setThreadNotVisible(getUser(), this.props.thread.id);
        this.setState({ hideThreadConfirmDialogOpen: false });
    }

    renderRepresentativeActions() {
        if (this.state.isRepresentative) {
            return (
                <div>
                    <IconButton
                        aria-label="Hide"
                        onClick={() => this.toggleHideConfirmation()}
                    >
                        <DeleteSweep />
                    </IconButton>

                    <Dialog
                        open={this.state.hideThreadConfirmDialogOpen}
                        onClose={() => this.closeHideThreadConfirmDialog()}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Are you sure you want to hide the post?"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Your action will be logged and visible to the community.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => this.closeHideThreadConfirmDialog()}
                                color="primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => this.hideThread()}
                                color="primary"
                                autoFocus
                            >
                                I am sure
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }

    renderCardActions(renderReadMoreButton: boolean) {
        if (getUser().name != null) {
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
                    {this.renderReadMoreButton(renderReadMoreButton)}
                    {this.renderRepresentativeActions()}
                </CardActions>
            );
        }
    }

    renderTimeAgo(timestamp: number) {
        return (
            <Typography className="thread-timestamp" variant="body2" component="span">
                {timeAgoReadable(timestamp)}
            </Typography>
        )
    }

    renderReadMoreButton(renderReadMoreButton: boolean) {
        if (renderReadMoreButton) {
            return (
                <Link to={this.getRootPostId()}>
                    <IconButton aria-label="Read more">
                        <MoreHoriz />
                    </IconButton>
                </Link>
            );
        }
    }

    toggleReplyBox(): void {
        this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }));
    }

    renderReplyBox() {
        if (this.state.replyBoxOpen) {
            return <Card key={"reply-box"}>{this.renderReplyForm()}</Card>;
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

    render() {
        if (this.state.redirectToFullCard) {
            return (<Redirect key={"red-" + this.props.thread.id} to={this.getRootPostId()} />);
        } else if (this.props.truncated) {
            return this.renderTruncatedThreadCard();
        } else {
            return this.renderFullThreadCard();
        }
    }
}
