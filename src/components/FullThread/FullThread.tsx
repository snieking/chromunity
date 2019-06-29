import React from "react";
import {Link} from 'react-router-dom'
import {
    getSubThreadsByParentId,
    getThreadById,
    getThreadStarRating,
    removeStarRate,
    starRate
} from "../../blockchain/MessageService";
import {Thread} from "../../types";
import {Container, Dialog} from "@material-ui/core";

import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton";
import {Reply, StarRate} from "@material-ui/icons";
import Card from "@material-ui/core/Card";
import {RouteComponentProps} from "react-router";
import Header from "../Header/Header";
import Badge from "@material-ui/core/Badge";
import {getUser} from "../../util/user-util";


interface MatchParams {
    id: string
}

export interface FullThreadProps extends RouteComponentProps<MatchParams> {

}

export interface FullThreadState {
    thread: Thread,
    subThreads: Thread[],
    stars: number,
    starRatedByMe: boolean
}

export class FullThread extends React.Component<FullThreadProps, FullThreadState> {

    constructor(props: FullThreadProps) {
        super(props);

        const initialThread: Thread = {
            id: "",
            author: "",
            message: "",
            timestamp: 0,
            starRatedBy: []
        };

        this.state = {
            thread: initialThread,
            stars: 0,
            starRatedByMe: false,
            subThreads: []
        };
    }

    componentDidMount(): void {
        const id = this.props.match.params.id;
        getThreadById(id).then(receivedThread => {
            console.log("Retrieved thread: ", receivedThread);
            this.setState(prevState => ({
                thread: receivedThread,
                stars: prevState.stars,
                subThreads: prevState.subThreads
            }));
            console.log("Thread after fetching: ", this.state.thread);
        });

        getSubThreadsByParentId(id).then(subThreads => {
            console.log("Sub threads");
            this.setState(prevState => ({
                thread: prevState.thread,
                stars: prevState.stars,
                subThreads: subThreads
            }));
        });

        getThreadStarRating(id).then(usersWhoStarRated => {
            console.log("Stars: ", usersWhoStarRated);
            const starRatedByMe: boolean = this.starRatedByMe(usersWhoStarRated);
            this.setState(prevState => ({
                thread: prevState.thread,
                stars: usersWhoStarRated.length,
                starRatedByMe: starRatedByMe
            }));
            console.log("Thread after fetching star rating: ", this.state.thread);
        });
    }

    starRatedByMe(usersWhoStarRated: string[]): boolean {
        const username = getUser().name;
        return username !== null && usersWhoStarRated.includes(username);
    }

    toggleStarRate() {
        const id = this.state.thread.id;
        console.log("Thread to rate star: ", this.state.thread);
        const encryptedKey = getUser().encryptedKey;
        if (encryptedKey != null) {
            if (this.state.starRatedByMe) {
                removeStarRate(encryptedKey, id);
                this.setState(prevState => ({
                    thread: prevState.thread,
                    stars: prevState.stars-1,
                    starRatedByMe: false
                }))
            } else {
                starRate(encryptedKey, id);
                this.setState(prevState => ({
                    thread: prevState.thread,
                    stars: prevState.stars+1,
                    starRatedByMe: true
                }))
            }
        }
    }

    toggleReplyBox() {
        console.log("Opening reply box");
    }

    renderCard(thread: Thread, mainCard: boolean) {
        return(
            <Card key={thread.id} className="thread-card">
                <CardContent>
                    <Typography gutterBottom variant="h6" component="h6">
                        <Link to={"/u/" + thread.author}>@{thread.author}</Link>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {this.state.thread.message}
                    </Typography>
                </CardContent>
                {mainCard ? this.renderMainCardAction() : <div></div>}
            </Card>
        )
    }

    renderMainCardAction() {
        return (
            <CardActions>
                <IconButton className={(this.state.starRatedByMe ? 'yellow-icon' : '')} aria-label="Like" onClick={() => this.toggleStarRate()}>
                    <Badge className="star-badge" color="secondary" badgeContent={this.state.stars}>
                        <StarRate/>
                    </Badge>
                </IconButton>
                <IconButton aria-label="Like" onClick={() => this.toggleReplyBox()}>
                    <Reply/>
                </IconButton>
            </CardActions>
        )
    }

    renderSubThreads() {
        return this.state.subThreads.map(thread => this.renderCard(thread, false));
    }

    render() {
        return (
            <div>
                <Header/>
                <Container fixed>
                    <br/>
                    {this.renderCard(this.state.thread, true)}
                    {this.renderSubThreads()}
                </Container>
            </div>
        )
    }
}
