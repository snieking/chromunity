import React from "react";
import {Link} from 'react-router-dom'
import {Thread} from "../../types";
import {getSubThreadsByParentId, getThreadStarRating, removeStarRate, starRate} from "../../blockchain/MessageService";
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

export interface ThreadCardProps {
    thread: Thread,
    truncated: boolean
}

export interface ThreadCardState {
    stars: number,
    ratedByMe: boolean,
    redirectToFullCard: boolean
}

export class ThreadCard extends React.Component<ThreadCardProps, ThreadCardState> {

    constructor(props: ThreadCardProps) {
        super(props);

        this.state = {
            stars: 0,
            ratedByMe: false,
            redirectToFullCard: false
        }
    }

    static isRatedByMe(upvoters: string[]): boolean {
        const username = getUser().name;
        return username !== null && upvoters.includes(username);
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
        }
    }

    toggleStarRate() {
        const id = this.props.thread.id;
        console.log("Thread to rate star: ", id);
        const encryptedKey = getUser().encryptedKey;
        if (encryptedKey != null) {
            if (this.state.ratedByMe) {
                removeStarRate(getUser(), id);
                this.setState(prevState => ({
                    stars: prevState.stars - 1,
                    ratedByMe: false
                }));
            } else {
                starRate(getUser(), id);
                this.setState(prevState => ({
                    stars: prevState.stars + 1,
                    ratedByMe: true
                }));
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
                {this.renderCardActions()}
            </Card>
        )
    }

    renderFullThreadCard() {
        return (
            <Card key={this.props.thread.id} className="thread-card">
                {this.renderCardContent(this.props.thread.message)}
                {this.renderCardActions()}
            </Card>
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

    renderCardActions() {
        return (
            <CardActions>
                <IconButton className={(this.state.ratedByMe ? 'yellow-icon' : '')} aria-label="Like"
                            onClick={() => this.toggleStarRate()}>
                    <Badge className="star-badge" color="secondary" badgeContent={this.state.stars}>
                        <StarRate/>
                    </Badge>
                </IconButton>
                <IconButton aria-label="Like">
                    <Reply/>
                </IconButton>
            </CardActions>
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
